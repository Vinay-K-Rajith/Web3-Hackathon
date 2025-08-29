;; =============================================================================
;; Agricultural Supply Chain Smart Contract
;; Tracks agricultural products through their complete supply chain journey
;; =============================================================================

;; =============================================================================
;; CONSTANTS
;; =============================================================================

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-OWNER-ONLY (err u100))
(define-constant ERR-NOT-FOUND (err u101))
(define-constant ERR-ALREADY-EXISTS (err u102))
(define-constant ERR-UNAUTHORIZED (err u103))
(define-constant ERR-INVALID-INPUT (err u104))
(define-constant ERR-PRODUCT-INACTIVE (err u105))

;; =============================================================================
;; DATA VARIABLES
;; =============================================================================

(define-data-var next-product-id uint u1)
(define-data-var next-step-id uint u1)
(define-data-var next-verification-id uint u1)

;; =============================================================================
;; DATA MAPS
;; =============================================================================

;; Main product registry
(define-map products
  { product-id: uint }
  {
    name: (string-ascii 100),
    product-type: (string-ascii 50),
    quantity: uint,
    farm-location: (string-ascii 200),
    certifications: (list 10 (string-ascii 50)),
    farmer: principal,
    created-at: uint,
    active: bool
  }
)

;; Supply chain tracking steps
(define-map supply-chain-steps
  { step-id: uint }
  {
    product-id: uint,
    stage: (string-ascii 50),
    location: (string-ascii 200),
    company: (string-ascii 100),
    status: (string-ascii 20),
    timestamp: uint,
    quality-metrics: (optional (string-ascii 500)),
    verifier: principal
  }
)

;; Product ownership mapping
(define-map product-farmers
  { product-id: uint }
  { farmer: principal }
)

;; Farmer's product listing
(define-map farmer-products
  { farmer: principal, product-index: uint }
  { product-id: uint }
)

;; Count of products per farmer
(define-map farmer-product-count
  { farmer: principal }
  { count: uint }
)

;; Quality verification records
(define-map quality-verifications
  { product-id: uint, verification-id: uint }
  {
    verifier: principal,
    certification-type: (string-ascii 50),
    verified: bool,
    verification-data: (optional (string-ascii 500)),
    created-at: uint
  }
)

;; Product step tracking (for efficient retrieval)
(define-map product-step-count
  { product-id: uint }
  { count: uint }
)

(define-map product-steps
  { product-id: uint, step-index: uint }
  { step-id: uint }
)

;; =============================================================================
;; READ-ONLY FUNCTIONS
;; =============================================================================

(define-read-only (get-product (product-id uint))
  (map-get? products { product-id: product-id })
)

(define-read-only (get-supply-chain-step (step-id uint))
  (map-get? supply-chain-steps { step-id: step-id })
)

(define-read-only (get-farmer-product-count (farmer principal))
  (default-to u0 (get count (map-get? farmer-product-count { farmer: farmer })))
)

(define-read-only (get-farmer-product (farmer principal) (index uint))
  (map-get? farmer-products { farmer: farmer, product-index: index })
)

(define-read-only (get-next-product-id)
  (var-get next-product-id)
)

(define-read-only (get-next-step-id)
  (var-get next-step-id)
)

(define-read-only (get-next-verification-id)
  (var-get next-verification-id)
)

(define-read-only (get-product-step-count (product-id uint))
  (default-to u0 (get count (map-get? product-step-count { product-id: product-id })))
)

(define-read-only (get-product-step (product-id uint) (step-index uint))
  (map-get? product-steps { product-id: product-id, step-index: step-index })
)

(define-read-only (get-quality-verification (product-id uint) (verification-id uint))
  (map-get? quality-verifications { product-id: product-id, verification-id: verification-id })
)

(define-read-only (is-product-active (product-id uint))
  (match (get-product product-id)
    product (get active product)
    false
  )
)

(define-read-only (is-farmer-authorized (product-id uint) (farmer principal))
  (match (get-product product-id)
    product (is-eq farmer (get farmer product))
    false
  )
)

;; =============================================================================
;; PRIVATE FUNCTIONS
;; =============================================================================

(define-private (is-valid-string-100 (str (string-ascii 100)))
  (> (len str) u0)
)

(define-private (is-valid-string-200 (str (string-ascii 200)))
  (> (len str) u0)
)

(define-private (is-valid-string-50 (str (string-ascii 50)))
  (> (len str) u0)
)

(define-private (is-valid-string-20 (str (string-ascii 20)))
  (> (len str) u0)
)

(define-private (add-step-to-product (product-id uint) (step-id uint))
  (let ((step-count (get-product-step-count product-id)))
    (and
      (map-set product-steps
        { product-id: product-id, step-index: step-count }
        { step-id: step-id }
      )
      (map-set product-step-count
        { product-id: product-id }
        { count: (+ step-count u1) }
      )
    )
  )
)

;; =============================================================================
;; PUBLIC FUNCTIONS
;; =============================================================================

(define-public (register-product 
  (name (string-ascii 100))
  (product-type (string-ascii 50))
  (quantity uint)
  (farm-location (string-ascii 200))
  (certifications (list 10 (string-ascii 50)))
)
  (let (
    (product-id (var-get next-product-id))
    (farmer-count (get-farmer-product-count tx-sender))
  )
    ;; Input validation
    (asserts! (is-valid-string-100 name) ERR-INVALID-INPUT)
    (asserts! (is-valid-string-50 product-type) ERR-INVALID-INPUT)
    (asserts! (> quantity u0) ERR-INVALID-INPUT)
    (asserts! (is-valid-string-200 farm-location) ERR-INVALID-INPUT)
    
    ;; Create product record
    (asserts! (map-insert products
      { product-id: product-id }
      {
        name: name,
        product-type: product-type,
        quantity: quantity,
        farm-location: farm-location,
        certifications: certifications,
        farmer: tx-sender,
        created-at: block-height,
        active: true
      }
    ) ERR-ALREADY-EXISTS)
    
    ;; Update farmer mappings
    (map-set product-farmers
      { product-id: product-id }
      { farmer: tx-sender }
    )
    
    (map-set farmer-products
      { farmer: tx-sender, product-index: farmer-count }
      { product-id: product-id }
    )
    
    (map-set farmer-product-count
      { farmer: tx-sender }
      { count: (+ farmer-count u1) }
    )
    
    ;; Initialize product step count
    (map-set product-step-count
      { product-id: product-id }
      { count: u0 }
    )
    
    ;; Update next product ID
    (var-set next-product-id (+ product-id u1))
    
    (ok product-id)
  )
)

(define-public (add-supply-chain-step
  (product-id uint)
  (stage (string-ascii 50))
  (location (string-ascii 200))
  (company (string-ascii 100))
  (status (string-ascii 20))
  (quality-metrics (optional (string-ascii 500)))
)
  (let ((step-id (var-get next-step-id)))
    ;; Validate product exists and is active
    (asserts! (is-some (get-product product-id)) ERR-NOT-FOUND)
    (asserts! (is-product-active product-id) ERR-PRODUCT-INACTIVE)
    
    ;; Input validation
    (asserts! (is-valid-string-50 stage) ERR-INVALID-INPUT)
    (asserts! (is-valid-string-200 location) ERR-INVALID-INPUT)
    (asserts! (is-valid-string-100 company) ERR-INVALID-INPUT)
    (asserts! (is-valid-string-20 status) ERR-INVALID-INPUT)
    
    ;; Create supply chain step
    (asserts! (map-insert supply-chain-steps
      { step-id: step-id }
      {
        product-id: product-id,
        stage: stage,
        location: location,
        company: company,
        status: status,
        timestamp: block-height,
        quality-metrics: quality-metrics,
        verifier: tx-sender
      }
    ) ERR-ALREADY-EXISTS)
    
    ;; Link step to product
    (asserts! (add-step-to-product product-id step-id) ERR-INVALID-INPUT)
    
    ;; Update next step ID
    (var-set next-step-id (+ step-id u1))
    
    (ok step-id)
  )
)

(define-public (verify-quality
  (product-id uint)
  (certification-type (string-ascii 50))
  (verified bool)
  (verification-data (optional (string-ascii 500)))
)
  (let ((verification-id (var-get next-verification-id)))
    ;; Validate product exists and is active
    (asserts! (is-some (get-product product-id)) ERR-NOT-FOUND)
    (asserts! (is-product-active product-id) ERR-PRODUCT-INACTIVE)
    
    ;; Input validation
    (asserts! (is-valid-string-50 certification-type) ERR-INVALID-INPUT)
    
    ;; Create quality verification
    (asserts! (map-insert quality-verifications
      { product-id: product-id, verification-id: verification-id }
      {
        verifier: tx-sender,
        certification-type: certification-type,
        verified: verified,
        verification-data: verification-data,
        created-at: block-height
      }
    ) ERR-ALREADY-EXISTS)
    
    ;; Update next verification ID
    (var-set next-verification-id (+ verification-id u1))
    
    (ok verification-id)
  )
)

(define-public (update-product-status (product-id uint) (active bool))
  (let ((product (unwrap! (get-product product-id) ERR-NOT-FOUND)))
    ;; Only farmer can update their product status
    (asserts! (is-eq tx-sender (get farmer product)) ERR-UNAUTHORIZED)
    
    ;; Update product status
    (asserts! (map-set products
      { product-id: product-id }
      (merge product { active: active })
    ) ERR-INVALID-INPUT)
    
    (ok true)
  )
)

(define-public (transfer-product-ownership 
  (product-id uint) 
  (new-farmer principal)
)
  (let ((product (unwrap! (get-product product-id) ERR-NOT-FOUND)))
    ;; Only current farmer can transfer ownership
    (asserts! (is-eq tx-sender (get farmer product)) ERR-UNAUTHORIZED)
    (asserts! (is-product-active product-id) ERR-PRODUCT-INACTIVE)
    
    ;; Update product farmer
    (asserts! (map-set products
      { product-id: product-id }
      (merge product { farmer: new-farmer })
    ) ERR-INVALID-INPUT)
    
    ;; Update farmer mapping
    (map-set product-farmers
      { product-id: product-id }
      { farmer: new-farmer }
    )
    
    ;; Add to new farmer's product list
    (let ((new-farmer-count (get-farmer-product-count new-farmer)))
      (map-set farmer-products
        { farmer: new-farmer, product-index: new-farmer-count }
        { product-id: product-id }
      )
      (map-set farmer-product-count
        { farmer: new-farmer }
        { count: (+ new-farmer-count u1) }
      )
    )
    
    (ok true)
  )
)

(define-public (batch-add-certifications
  (product-id uint)
  (new-certifications (list 10 (string-ascii 50)))
)
  (let ((product (unwrap! (get-product product-id) ERR-NOT-FOUND)))
    ;; Only farmer can add certifications
    (asserts! (is-eq tx-sender (get farmer product)) ERR-UNAUTHORIZED)
    (asserts! (is-product-active product-id) ERR-PRODUCT-INACTIVE)
    
    ;; Merge existing and new certifications (simplified - in practice you'd want to avoid duplicates)
    (let ((updated-certifications new-certifications))
      (asserts! (map-set products
        { product-id: product-id }
        (merge product { certifications: updated-certifications })
      ) ERR-INVALID-INPUT)
    )
    
    (ok true)
  )
)

;; =============================================================================
;; ADMIN FUNCTIONS (Contract Owner Only)
;; =============================================================================

(define-public (emergency-deactivate-product (product-id uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-OWNER-ONLY)
    (let ((product (unwrap! (get-product product-id) ERR-NOT-FOUND)))
      (asserts! (map-set products
        { product-id: product-id }
        (merge product { active: false })
      ) ERR-INVALID-INPUT)
      (ok true)
    )
  )
)