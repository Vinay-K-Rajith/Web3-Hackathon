import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
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
import { apiRequest } from "@/lib/queryClient";
import { registerProductOnBlockchain } from "@/lib/stacks";

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
  const { isConnected } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const mutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      // First register on blockchain
      const blockchainResult = await registerProductOnBlockchain(data);
      
      // Then save to database
      const response = await apiRequest("POST", "/api/products", {
        ...data,
        blockchainId: blockchainResult.productId,
        transactionHash: blockchainResult.transactionHash,
      });
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      
      form.reset();
      toast({
        title: "Product Registered",
        description: "Your product has been successfully registered on the blockchain.",
      });
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: "Failed to register product. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    if (!isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to register products.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await mutation.mutateAsync(data);
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
