import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { registerProductOnBlockchain } from "@/lib/stacks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PlusCircle } from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  productType: z.string().min(1, "Product type is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  farmLocation: z.string().min(1, "Farm location is required"),
  certifications: z.array(z.string()).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function ProductRegistration() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isConnected, address } = useWallet();
  const { toast } = useToast();
  const [location, navigate] = useLocation();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      productType: "",
      quantity: 0,
      farmLocation: "",
      certifications: [],
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to register products.",
        variant: "destructive",
      });
      return;
    }

    console.log('🚀 Starting product registration...');
    console.log('📝 Form data:', data);

    setIsSubmitting(true);
    try {
      const result = await registerProductOnBlockchain(data);
      console.log('✅ Registration result:', result);

      toast({
        title: "Transaction Submitted",
        description: `Transaction submitted! Hash: ${result.transactionHash}. Check console for status updates.`,
      });

      // Save to local API
      const productToSave = {
        name: data.name,
        productType: data.productType,
        quantity: data.quantity,
        farmLocation: data.farmLocation,
        certifications: data.certifications || [],
        farmerId: address,
        blockchainId: result.productId,
        transactionHash: result.transactionHash
      };

      const apiResponse = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productToSave),
      });

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        throw new Error(`Failed to save to local API: ${errorText}`);
      }

      const savedProduct = await apiResponse.json();

      // Auto-add initial farm step
      const initialStep = {
        productId: savedProduct.id,
        stage: 'farm',
        location: data.farmLocation,
        company: address, // Use wallet address as company for farm
        status: 'completed'
      };

      const stepResponse = await fetch('/api/supply-chain-steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(initialStep),
      });

      if (!stepResponse.ok) {
        throw new Error('Failed to add initial supply chain step');
      }

      toast({
        title: "Product Saved",
        description: "Product has been saved with initial farm step and is now visible in supply chain.",
      });

      form.reset();
      navigate('/supply-chain');
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register product. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const certificationOptions = [
    { id: "organic", label: "Organic" },
    { id: "non-gmo", label: "Non-GMO" },
    { id: "fair-trade", label: "Fair Trade" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <PlusCircle className="w-5 h-5 text-primary" />
          <span>Register New Product</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Organic Tomatoes" 
                      {...field}
                      data-testid="input-product-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="productType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-product-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Vegetables">Vegetables</SelectItem>
                        <SelectItem value="Fruits">Fruits</SelectItem>
                        <SelectItem value="Grains">Grains</SelectItem>
                        <SelectItem value="Dairy">Dairy</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity (kg)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="100"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        data-testid="input-quantity"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="farmLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Farm Location</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Farm address or coordinates" 
                      {...field}
                      data-testid="input-farm-location"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="certifications"
              render={() => (
                <FormItem>
                  <FormLabel>Certifications</FormLabel>
                  <div className="flex flex-wrap gap-4">
                    {certificationOptions.map((option) => (
                      <FormField
                        key={option.id}
                        control={form.control}
                        name="certifications"
                        render={({ field }) => (
                          <FormItem
                            key={option.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(option.label)}
                                onCheckedChange={(checked) => {
                                  const value = field.value || [];
                                  return checked
                                    ? field.onChange([...value, option.label])
                                    : field.onChange(value.filter((item) => item !== option.label));
                                }}
                                data-testid={`checkbox-${option.id}`}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
                              {option.label}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || !isConnected}
              data-testid="button-register-blockchain"
            >
              {isSubmitting ? "Registering on Blockchain..." : "Register on Blockchain"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
