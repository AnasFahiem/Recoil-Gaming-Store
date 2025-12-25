export const mockProducts = [
    { id: 1, name: "Vapor X Control", price: 49.99, stock: 45, category: "Mousepad" },
    { id: 2, name: "Glacier Glass V2", price: 89.99, stock: 23, category: "Mousepad" },
]

export const mockOrders = [
    { id: "ORD-001", customer: "john@example.com", total: 49.99, status: "Pending", date: "2024-12-12", items: ["Vapor X Control"] },
    { id: "ORD-002", customer: "jane@example.com", total: 89.99, status: "Shipped", date: "2024-12-11", items: ["Glacier Glass V2"] },
    // Mock orders for the demo user
    { id: "ORD-003", customer: "operative.one@recoil.gg", total: 139.98, status: "Processing", date: "2024-12-13", items: ["Vapor X Control", "Glacier Glass V2"] },
]
