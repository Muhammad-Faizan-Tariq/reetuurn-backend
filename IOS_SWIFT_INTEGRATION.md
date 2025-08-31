# iOS Swift Integration Guide

This guide explains how to integrate the return order payment flow into your iOS Swift application using Stripe.

## Prerequisites

1. **Stripe Account**: Set up a Stripe account and get your publishable key
2. **Backend API**: Ensure your backend is running and accessible
3. **iOS Project**: Xcode project with iOS 13.0+ target

## Installation

### 1. Add Stripe SDK

Add Stripe to your project using Swift Package Manager:

```swift
// In Xcode: File → Add Package Dependencies
// URL: https://github.com/stripe/stripe-ios
// Version: Latest stable release
```

Or add to your `Package.swift`:

```swift
dependencies: [
    .package(url: "https://github.com/stripe/stripe-ios", from: "23.0.0")
]
```

### 2. Add Required Frameworks

```swift
import Stripe
import StripePaymentSheet
```

## Configuration

### 1. Initialize Stripe

```swift
import UIKit
import Stripe

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        // Initialize Stripe with your publishable key
        StripeAPI.defaultPublishableKey = "pk_test_your_publishable_key_here"
        
        return true
    }
}
```

### 2. Create API Service

```swift
import Foundation

class ReturnOrderService {
    private let baseURL = "https://your-backend-url.com/api"
    private let authToken: String
    
    init(authToken: String) {
        self.authToken = authToken
    }
    
    // MARK: - Create Payment Intent
    func createPaymentIntent(packages: [Package], paymentMethod: String, currency: String = "EUR") async throws -> PaymentIntentResponse {
        let url = URL(string: "\(baseURL)/create-return-order/payment-intent")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body = PaymentIntentRequest(
            packages: packages,
            paymentMethod: paymentMethod,
            currency: currency
        )
        
        request.httpBody = try JSONEncoder().encode(body)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw APIError.invalidResponse
        }
        
        let apiResponse = try JSONDecoder().decode(APIResponse<PaymentIntentResponse>.self, from: data)
        return apiResponse.data
    }
    
    // MARK: - Confirm Payment and Create Order
    func confirmPaymentAndCreateOrder(paymentIntentId: String, orderData: OrderData) async throws -> OrderResponse {
        let url = URL(string: "\(baseURL)/create-return-order/confirm-payment")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body = ConfirmPaymentRequest(
            paymentIntentId: paymentIntentId,
            orderData: orderData
        )
        
        request.httpBody = try JSONEncoder().encode(body)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 201 else {
            throw APIError.invalidResponse
        }
        
        let apiResponse = try JSONDecoder().decode(APIResponse<OrderResponse>.self, from: data)
        return apiResponse.data
    }
}
```

## Data Models

### 1. Request Models

```swift
// MARK: - Package Model
struct Package: Codable {
    let size: PackageSize
    let dimensions: String
    let labelAttached: Bool
    let carrier: Carrier
    let price: Double?
    
    enum PackageSize: String, Codable, CaseIterable {
        case small = "small"
        case medium = "medium"
        case large = "large"
        case xlarge = "xlarge"
        
        var displayName: String {
            switch self {
            case .small: return "Small"
            case .medium: return "Medium"
            case .large: return "Large"
            case .xlarge: return "X-Large"
            }
        }
        
        var price: Double {
            switch self {
            case .small: return 4.99
            case .medium: return 6.99
            case .large: return 8.99
            case .xlarge: return 10.99
            }
        }
    }
    
    enum Carrier: String, Codable, CaseIterable {
        case postAT = "PostAT"
        case dhl = "DHL"
        case hermes = "Hermes"
        case dpd = "DPD"
        case ups = "UPS"
        case gls = "GLS"
    }
}

// MARK: - Payment Intent Request
struct PaymentIntentRequest: Codable {
    let packages: [Package]
    let paymentMethod: String
    let currency: String
}

// MARK: - Confirm Payment Request
struct ConfirmPaymentRequest: Codable {
    let paymentIntentId: String
    let orderData: OrderData
}

// MARK: - Order Data
struct OrderData: Codable {
    let pickupAddress: PickupAddress
    let packages: [Package]
    let schedule: Schedule
    let paymentMethod: String
    let currency: String
}

struct PickupAddress: Codable {
    let building: String
    let floor: String?
    let doorNumber: String?
    let directions: String?
    let contactPhone: String?
}

struct Schedule: Codable {
    let date: Date
    let timeWindow: TimeWindow
}

struct TimeWindow: Codable {
    let start: String
    let end: String
}
```

### 2. Response Models

```swift
// MARK: - API Response Wrapper
struct APIResponse<T: Codable>: Codable {
    let success: Bool
    let message: String
    let data: T
}

// MARK: - Payment Intent Response
struct PaymentIntentResponse: Codable {
    let clientSecret: String
    let amount: Int
    let currency: String
    let paymentIntentId: String
}

// MARK: - Order Response
struct OrderResponse: Codable {
    let order: Order
    let receipt: Receipt
}

struct Order: Codable {
    let id: String
    let orderNumber: String
    let status: String
    let payment: Payment
    let createdAt: Date
}

struct Payment: Codable {
    let status: String
    let amount: Double
    let currency: String
}

struct Receipt: Codable {
    let id: String
    let generatedAt: Date
}
```

### 3. Error Handling

```swift
enum APIError: Error, LocalizedError {
    case invalidResponse
    case paymentFailed
    case networkError
    case invalidData
    
    var errorDescription: String? {
        switch self {
        case .invalidResponse:
            return "Invalid response from server"
        case .paymentFailed:
            return "Payment failed"
        case .networkError:
            return "Network error occurred"
        case .invalidData:
            return "Invalid data received"
        }
    }
}
```

## UI Implementation

### 1. Package Selection View Controller

```swift
import UIKit

class PackageSelectionViewController: UIViewController {
    
    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var totalLabel: UILabel!
    @IBOutlet weak var continueButton: UIButton!
    
    private var packages: [Package] = []
    private let returnOrderService = ReturnOrderService(authToken: "your_auth_token")
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupTableView()
        updateTotal()
    }
    
    @IBAction func addPackageTapped(_ sender: UIButton) {
        let alert = UIAlertController(title: "Add Package", message: nil, preferredStyle: .actionSheet)
        
        for size in Package.PackageSize.allCases {
            alert.addAction(UIAlertAction(title: size.displayName, style: .default) { _ in
                self.addPackage(size: size)
            })
        }
        
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
        present(alert, animated: true)
    }
    
    @IBAction func continueTapped(_ sender: UIButton) {
        guard !packages.isEmpty else {
            showAlert(title: "Error", message: "Please add at least one package")
            return
        }
        
        Task {
            await createPaymentIntent()
        }
    }
    
    private func addPackage(size: Package.PackageSize) {
        let package = Package(
            size: size,
            dimensions: "20x15x10",
            labelAttached: true,
            carrier: .dhl,
            price: size.price
        )
        
        packages.append(package)
        tableView.reloadData()
        updateTotal()
    }
    
    private func updateTotal() {
        let total = packages.reduce(0) { $0 + ($1.price ?? $1.size.price) }
        totalLabel.text = String(format: "Total: €%.2f", total)
        continueButton.isEnabled = !packages.isEmpty
    }
    
    private func createPaymentIntent() async {
        do {
            let response = try await returnOrderService.createPaymentIntent(
                packages: packages,
                paymentMethod: "stripe_card",
                currency: "EUR"
            )
            
            await MainActor.run {
                navigateToPayment(paymentIntentResponse: response)
            }
        } catch {
            await MainActor.run {
                showAlert(title: "Error", message: error.localizedDescription)
            }
        }
    }
    
    private func navigateToPayment(paymentIntentResponse: PaymentIntentResponse) {
        let paymentVC = PaymentViewController()
        paymentVC.paymentIntentResponse = paymentIntentResponse
        paymentVC.packages = packages
        navigationController?.pushViewController(paymentVC, animated: true)
    }
}

// MARK: - Table View Data Source
extension PackageSelectionViewController: UITableViewDataSource {
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return packages.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "PackageCell", for: indexPath)
        let package = packages[indexPath.row]
        
        cell.textLabel?.text = "\(package.size.displayName) - \(package.carrier.rawValue)"
        cell.detailTextLabel?.text = String(format: "€%.2f", package.price ?? package.size.price)
        
        return cell
    }
}
```

### 2. Payment View Controller

```swift
import UIKit
import Stripe
import StripePaymentSheet

class PaymentViewController: UIViewController {
    
    @IBOutlet weak var paymentSheetView: UIView!
    @IBOutlet weak var activityIndicator: UIActivityIndicatorView!
    
    var paymentIntentResponse: PaymentIntentResponse!
    var packages: [Package]!
    
    private var paymentSheet: PaymentSheet?
    private let returnOrderService = ReturnOrderService(authToken: "your_auth_token")
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupPaymentSheet()
    }
    
    private func setupPaymentSheet() {
        var configuration = PaymentSheet.Configuration()
        configuration.merchantDisplayName = "Your Company Name"
        configuration.defaultBillingDetails.name = "Customer Name"
        
        paymentSheet = PaymentSheet(paymentIntentClientSecret: paymentIntentResponse.clientSecret, configuration: configuration)
        
        paymentSheet?.present(from: self) { [weak self] result in
            switch result {
            case .completed:
                self?.handlePaymentSuccess()
            case .failed(let error):
                self?.handlePaymentError(error)
            case .canceled:
                self?.handlePaymentCancelled()
            }
        }
    }
    
    private func handlePaymentSuccess() {
        Task {
            await confirmPaymentAndCreateOrder()
        }
    }
    
    private func handlePaymentError(_ error: Error) {
        showAlert(title: "Payment Failed", message: error.localizedDescription)
    }
    
    private func handlePaymentCancelled() {
        showAlert(title: "Payment Cancelled", message: "Payment was cancelled by user")
    }
    
    private func confirmPaymentAndCreateOrder() async {
        await MainActor.run {
            activityIndicator.startAnimating()
        }
        
        do {
            let orderData = createOrderData()
            let response = try await returnOrderService.confirmPaymentAndCreateOrder(
                paymentIntentId: paymentIntentResponse.paymentIntentId,
                orderData: orderData
            )
            
            await MainActor.run {
                activityIndicator.stopAnimating()
                navigateToOrderConfirmation(order: response.order)
            }
        } catch {
            await MainActor.run {
                activityIndicator.stopAnimating()
                showAlert(title: "Error", message: error.localizedDescription)
            }
        }
    }
    
    private func createOrderData() -> OrderData {
        // This would typically come from user input forms
        let pickupAddress = PickupAddress(
            building: "123 Main St",
            floor: "2",
            doorNumber: "A",
            directions: "Near elevator",
            contactPhone: "+1234567890"
        )
        
        let schedule = Schedule(
            date: Date().addingTimeInterval(24 * 60 * 60), // Tomorrow
            timeWindow: TimeWindow(start: "09:00", end: "12:00")
        )
        
        return OrderData(
            pickupAddress: pickupAddress,
            packages: packages,
            schedule: schedule,
            paymentMethod: "stripe_card",
            currency: "EUR"
        )
    }
    
    private func navigateToOrderConfirmation(order: Order) {
        let confirmationVC = OrderConfirmationViewController()
        confirmationVC.order = order
        navigationController?.setViewControllers([confirmationVC], animated: true)
    }
}
```

### 3. Order Confirmation View Controller

```swift
import UIKit

class OrderConfirmationViewController: UIViewController {
    
    @IBOutlet weak var orderNumberLabel: UILabel!
    @IBOutlet weak var statusLabel: UILabel!
    @IBOutlet weak var amountLabel: UILabel!
    @IBOutlet weak var dateLabel: UILabel!
    
    var order: Order!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
    }
    
    private func setupUI() {
        orderNumberLabel.text = "Order: \(order.orderNumber)"
        statusLabel.text = "Status: \(order.status.capitalized)"
        amountLabel.text = String(format: "Amount: €%.2f", order.payment.amount)
        
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        dateLabel.text = "Created: \(formatter.string(from: order.createdAt))"
    }
    
    @IBAction func doneTapped(_ sender: UIButton) {
        // Navigate back to main screen
        navigationController?.popToRootViewController(animated: true)
    }
}
```

## Complete Flow Example

```swift
class ReturnOrderFlow {
    private let returnOrderService: ReturnOrderService
    
    init(authToken: String) {
        self.returnOrderService = ReturnOrderService(authToken: authToken)
    }
    
    func startReturnOrderFlow(from viewController: UIViewController) {
        let packageSelectionVC = PackageSelectionViewController()
        let navigationController = UINavigationController(rootViewController: packageSelectionVC)
        viewController.present(navigationController, animated: true)
    }
}
```

## Usage Example

```swift
class ViewController: UIViewController {
    
    @IBAction func createReturnOrderTapped(_ sender: UIButton) {
        let flow = ReturnOrderFlow(authToken: "your_auth_token")
        flow.startReturnOrderFlow(from: self)
    }
}
```

## Error Handling Best Practices

```swift
extension UIViewController {
    func showAlert(title: String, message: String) {
        let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }
    
    func showLoading() {
        // Show loading indicator
    }
    
    func hideLoading() {
        // Hide loading indicator
    }
}
```

## Testing

### 1. Test Card Numbers

```swift
// Use these test card numbers in development:
// Success: 4242 4242 4242 4242
// Decline: 4000 0000 0000 0002
// Requires Authentication: 4000 0025 0000 3155
```

### 2. Environment Configuration

```swift
enum Environment {
    case development
    case production
    
    var stripePublishableKey: String {
        switch self {
        case .development:
            return "pk_test_your_test_key"
        case .production:
            return "pk_live_your_live_key"
        }
    }
    
    var apiBaseURL: String {
        switch self {
        case .development:
            return "https://dev-api.yourdomain.com/api"
        case .production:
            return "https://api.yourdomain.com/api"
        }
    }
}
```

## Security Considerations

1. **Never store sensitive data locally**
2. **Use HTTPS for all API calls**
3. **Validate all user inputs**
4. **Handle errors gracefully**
5. **Use proper authentication tokens**
6. **Test thoroughly with Stripe test cards**

## Troubleshooting

### Common Issues

1. **Payment Sheet not appearing**: Check Stripe publishable key
2. **API calls failing**: Verify authentication token and network connectivity
3. **Payment declined**: Use correct test card numbers
4. **Build errors**: Ensure Stripe SDK is properly installed

### Debug Tips

```swift
// Enable Stripe logging in development
#if DEBUG
StripeAPI.verboseLoggingEnabled = true
#endif
```

This integration guide provides a complete iOS Swift implementation for the return order payment flow with Stripe integration.
