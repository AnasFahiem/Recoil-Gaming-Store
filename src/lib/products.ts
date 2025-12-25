export interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    category: "Mousepad" | "Accessory" | "Apparel";
    image: string;
    isNew?: boolean;
    specs?: {
        surface?: string;
        thickness?: string;
        friction?: string;
    }
}

export const products: Product[] = [
    {
        id: "vapor-x",
        name: "Vapor X Control",
        slug: "vapor-x-control",
        price: 49.99,
        category: "Mousepad",
        image: "/assets/product-placeholder.png",
        isNew: true,
        specs: {
            surface: "Frosted Polycarbonate",
            thickness: "4mm",
            friction: "Medium-High"
        }
    },
    {
        id: "glacier-v2",
        name: "Glacier Glass V2",
        slug: "glacier-glass-v2",
        price: 89.99,
        category: "Mousepad",
        image: "/assets/product-placeholder.png",
        specs: {
            surface: "Aluminosilicate Glass",
            thickness: "3mm",
            friction: "Ultra-Low"
        }
    },
    {
        id: "void-hybrid",
        name: "Void Hybrid Pro",
        slug: "void-hybrid-pro",
        price: 39.99,
        category: "Mousepad",
        image: "/assets/product-placeholder.png",
        specs: {
            surface: "Hybrid Cloth",
            thickness: "4mm",
            friction: "Medium"
        }
    },
    {
        id: "grip-tape",
        name: "Universal Grip Tape",
        slug: "universal-grip-tape",
        price: 14.99,
        category: "Accessory",
        image: "/assets/product-placeholder.png"
    },
    {
        id: "sleeve-arm",
        name: "Compression Sleeve",
        slug: "compression-sleeve",
        price: 29.99,
        category: "Apparel",
        image: "/assets/product-placeholder.png"
    },
    {
        id: "desk-mat",
        name: "Stealth Desk Mat",
        slug: "stealth-desk-mat",
        price: 24.99,
        category: "Accessory",
        image: "/assets/product-placeholder.png"
    }
];
