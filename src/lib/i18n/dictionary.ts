export type Locale = 'en' | 'ar'

export const dictionary = {
    en: {
        nav: {
            shop: "Shop",
            bundles: "Bundles",
            creators: "Creators",
            technology: "Technology",
            signIn: "Sign In",
            join: "Join Squadron",
            subscribe: "Subscribe",
            myDashboard: "My Dashboard",
            signOut: "Sign Out"
        },
        hero: {
            badge: "New Release: Vapor X Series",
            headline: "PRECISION",
            subheadline: "REDEFINED",
            description: "Engineered for zero drift. The first pro-grade polycarbonate surface designed for the world's most elite competitors.",
            ctaShop: "Shop Collection",
            ctaTech: "Discover Tech"
        },
        common: {
            loading: "Loading...",
            language: "Language",
            search: "Search products...",
            noResults: "No products found.",
            viewAll: "View all results",
            cart: "Your Cart",
            emptyCart: "Your cart is empty",
            subtotal: "Subtotal",
            checkout: "Checkout",
            addToCart: "Add to Cart",
            outOfStock: "Out of Stock",
            size: "Size",
            features: "Features",
            egypt: "Egypt",
            total: "Total",
            shippingCost: "Shipping",
            actions: "Actions",
            edit: "Edit",
            delete: "Delete",
            cancel: "Cancel",
            save: "Save",
            refresh: "Refresh",
            confirmDelete: "Are you sure? This action cannot be undone."
        },
        checkout: {
            title: "Checkout",
            contact: "Contact Information",
            shipping: "Shipping Address",
            payment: "Payment",
            placeOrder: "Place Order",
            orderSummary: "Order Summary",
            savedAddress: "Use Saved Address",
            newAddress: "New Address",
            saveProfile: "Save this address to my profile",
            name: "Full Name",
            address: "Address",
            city: "City",
            state: "Governorate",
            zip: "ZIP Code",
            phone: "Phone Number"
        },
        dashboard: {
            title: "User Hub",
            orders: "My Orders",
            settings: "Account Settings",
            profile: "Profile",
            address: "Address",
            security: "Security",
            saveChanges: "Save Changes",
            welcome: "Welcome",
            trackOrders: "Track status, view history, and inspect gear acquisitions.",
            manageAccount: "Manage identification, comms (address), and security protocols.",
            uploadPhoto: "Upload Photo",
            changePassword: "Change Password",
            newPassword: "New Password",
            confirmPassword: "Confirm Password",
            passwordHint: "3-20 characters",
            currentRole: "Role",
            operative: "Operative"
        },
        creators: {
            joinTitle: "JOIN THE",
            squadron: "SQUADRON",
            description: "We collaborate with the world's most elite aimers and content creators to push the boundaries of performance.",
            programTitle: "Creator Program Opening Soon",
            programDesc: "Applications for the next wave of RECOIL partners will open in Q1 2025.",
            cta: "Register Interest"
        },
        technology: {
            title: "THE SCIENCE OF",
            zeroDrift: "ZERO DRIFT",
            description: "Every RECOIL surface is engineered with distinct material properties to eliminate sensor spin-out and provide consistent static friction.",
            multiLayerTitle: "Multi-Layer Polycarbonate",
            multiLayerDesc: "Our proprietary stack ensures the surface remains perfectly flat regardless of humidity or temperature changes.",
            nanoTextureTitle: "Nano-Texture Finish",
            nanoTextureDesc: "Micro-etched texture points allow optical sensors to track at 30k DPI with 0% deviation.",
            diamondEdgeTitle: "Diamond-Polished Edge",
            diamondEdgeDesc: "Edges are rounded and polished to prevent wrist irritation during extended play sessions.",
            readyToUpgrade: "READY TO UPGRADE?",
            shopSeries: "Shop The Series"
        },
        shopPage: {
            title: "Shop Collection",
            subtitle: "Precision tools for every playstyle. Choose your surface.",
            filters: {
                all: "ALL",
                bundles: "BUNDLES",
                mousepads: "MOUSEPADS",
                accessories: "ACCESSORIES",
                apparel: "APPAREL",
                control: "Control Pads",
                speed: "Speed Glass",
                figures: "Figures",
                flags: "Flags",
                skates: "Skates"
            },
            noProductsTitle: "No Equipment Found",
            noProductsDesc: "No products match the selected filters."
        },
        admin: {
            dashboard: "Admin Dashboard",
            backToSite: "Back to Site",
            products: "Products",
            orders: "Orders",
            bundleMaker: "Bundle Maker",
            users: "Users",
            analytics: "Analytics",
            settingsNav: "Settings",
            addProduct: "Add Product",
            createBundle: "Create Bundle",
            missionAnalytics: "Mission Analytics",
            realTimeIntel: "Real-time intelligence on store performance.",
            table: {
                product: "Product",
                category: "Category",
                price: "Price",
                orderId: "Order ID",
                customer: "Customer",
                items: "Items",
                status: "Status",
                date: "Date",
                bundleName: "Bundle Name",
                email: "Email",
                phone: "Phone",
                role: "Role",
                joined: "Date Joined"
            },
            status: {
                processing: "Processing",
                shipped: "Shipped",
                delivered: "Delivered",
                cancelled: "Cancelled",
                cancellation_requested: "Cancellation Requested",
                approve_cancel: "Approve Cancel"
            },
            analyticsLabels: {
                totalVisits: "Total Visits",
                uniqueVisitors: "Unique Visitors",
                registeredOperatives: "Registered Operatives",
                squadronRecruits: "Squadron Recruits",
                totalRevenue: "Total Revenue",
                conversionRate: "Conversion Rate",
                avgOrderValue: "Avg Order Value",
                recentRecruits: "Recent Recruits",
                trafficIntel: "Traffic Intel (Last 30 Days)"
            },
            empty: {
                products: "No products found. Run SQL Seed!",
                orders: "No orders yet",
                bundles: "No bundles found. Create one!",
                traffic: "No traffic data recorded yet.",
                recruits: "No recruits yet."
            },
            actions: {
                demote: "Demote",
                makeAdmin: "Make Admin",
                deleteUser: "Delete User",
                confirmDelete: "Are you sure? This cannot be undone.",
                confirmDeleteUser: "Are you sure? This will delete the user's login and data permanently.",
                confirmApproveCancel: "Are you sure you want to approve this cancellation? The order will be permanently deleted and the user notified."
            },
            settings: {
                manageProfile: "Manage My User Profile",
                manageProfileDesc: "To manage your username, address, and profile picture, visit your personal dashboard."
            }
        },
        home: {
            featured: "Featured",
            gear: "Gear",
            description: "Pro-grade equipment used by the world's top esports athletes. Engineered for zero compromises.",
            viewAll: "View All Products",
            joinTitle: "Join the RECOIL Squadron",
            joinDesc: "Sign up for early access to limited edition drops and exclusive pro events."
        },
        newsletter: {
            placeholder: "Enter your email",
            button: "Subscribe",
            subscribing: "Subscribing...",
            success: "Welcome to the Squadron! Check your email.",
            error: "Something went wrong. Try again."
        },
        footer: {
            links: "Quick Links",
            legal: "Legal",
            social: "Follow Us",
            newsletter: "Join the Squadron",
            rights: "All rights reserved."
        },
        product: {
            backToShop: "Back to Shop",
            inStock: "In Stock",
            quantity: "Quantity",
            includedInBundle: "Included in Bundle",
            addToCart: "Add to Cart",
            freeShipping: "Free Shipping",
            warranty: "2 Year Warranty",
            secureCheckout: "Secure Checkout",
            egp: "EGP"
        }
    },
    ar: {
        nav: {
            shop: "المتجر",
            bundles: "المجموعات",
            creators: "المبدعين",
            technology: "التقنية",
            signIn: "تسجيل دخول",
            join: "إنضم للفريق",
            subscribe: "اشترك",
            myDashboard: "لوحة التحكم",
            signOut: "خروج"
        },
        hero: {
            badge: "إصدار جديد: سلسلة Vapor X",
            headline: "الدقة",
            subheadline: "بمفهوم جديد",
            description: "صُممت لثبات مثالي. أول سطح بولي كربونات احترافي مصمم لأفضل اللاعبين في العالم.",
            ctaShop: "تصفح المجموعة",
            ctaTech: "اكتشف التقنية"
        },
        common: {
            loading: "جاري التحميل...",
            language: "اللغة",
            search: "ابحث عن منتج...",
            noResults: "لا توجد نتائج.",
            viewAll: "عرض كل النتائج",
            cart: "عربتك",
            emptyCart: "عربتك فارغة",
            subtotal: "الصافي",
            checkout: "إتمام الشراء",
            addToCart: "أضف للعربة",
            outOfStock: "نفذت الكمية",
            size: "المقاس",
            features: "المميزات",
            egypt: "مصر",
            total: "الإجمالي",
            shippingCost: "الشحن",
            actions: "إجراءات",
            edit: "تعديل",
            delete: "حذف",
            cancel: "إلغاء",
            save: "حفظ",
            refresh: "تحديث",
            confirmDelete: "هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء."
        },
        checkout: {
            title: "إتمام الشراء",
            contact: "بيانات التواصل",
            shipping: "عنوان الشحن",
            payment: "الدفع",
            placeOrder: "تأكيد الطلب",
            orderSummary: "ملخص الطلب",
            savedAddress: "استخدم العنوان المحفوظ",
            newAddress: "عنوان جديد",
            saveProfile: "حفظ العنوان في ملفي الشخصي",
            name: "الاسم الكامل",
            address: "العنوان",
            city: "المدينة",
            state: "المحافظة",
            zip: "الرمز البريدي",
            phone: "رقم الهاتف"
        },
        dashboard: {
            title: "مركز المستخدم",
            orders: "طلباتي",
            settings: "إعدادات الحساب",
            profile: "الملف الشخصي",
            address: "العنوان",
            security: "الأمان",
            saveChanges: "حفظ التغييرات",
            welcome: "أهلاً بك",
            trackOrders: "تتبع الحالة، عرض السجل، وتفقد مشترياتك.",
            manageAccount: "إدارة الهوية، العنوان، وإعدادات الأمان.",
            uploadPhoto: "تغيير الصورة",
            changePassword: "تغيير كلمة المرور",
            newPassword: "كلمة المرور الجديدة",
            confirmPassword: "تأكيد كلمة المرور",
            passwordHint: "3-20 حرفاً",
            currentRole: "الصلاحية",
            operative: "عميل"
        },
        creators: {
            joinTitle: "انضم إلى",
            squadron: "الفريق",
            description: "نتعاون مع نخبة اللاعبين وصناع المحتوى حول العالم لدفع حدود الأداء.",
            programTitle: "برنامج المبدعين قريباً",
            programDesc: "سيتم فتح باب التقديم للدفعة القادمة من شركاء RECOIL في الربع الأول من 2025.",
            cta: "سجل اهتمامك"
        },
        technology: {
            title: "علم",
            zeroDrift: "الصفر انحراف",
            description: "صُمم كل سطح من RECOIL بخصائص مادية متميزة للقضاء على انزلاق المستشعر وتوفير احتكاك ثابت ومتسق.",
            multiLayerTitle: "بولي كربونات متعدد الطبقات",
            multiLayerDesc: "تضمن طبقاتنا الخاصة بقاء السطح مستوياً تماماً بغض النظر عن تغيرات الرطوبة أو درجة الحرارة.",
            nanoTextureTitle: "طلاء نانو تكستشر",
            nanoTextureDesc: "تسمح نقاط الملمس المحفورة بدقة للمستشعرات البصرية بالتتبع بدقة 30 ألف نقطة لكل بوصة مع انحراف 0%.",
            diamondEdgeTitle: "حواف مصقولة بالألماس",
            diamondEdgeDesc: "الحواف مستديرة ومصقولة لمنع تهيج المعصم أثناء جلسات اللعب الطويلة.",
            readyToUpgrade: "جاهز للتطوير؟",
            shopSeries: "تسوق السلسلة"
        },
        shopPage: {
            title: "تصفح المجموعة",
            subtitle: "أدوات دقيقة لكل أسلوب لعب. اختر سطحك.",
            filters: {
                all: "الكل",
                bundles: "المجموعات",
                mousepads: "ماوس باد",
                accessories: "إكسسوارات",
                apparel: "ملابس",
                control: "تحكم (Control)",
                speed: "زجاج (Speed)",
                figures: "مجسمات",
                flags: "أعلام",
                skates: "مزلاجات (Skates)"
            },
            noProductsTitle: "لا توجد منتجات",
            noProductsDesc: "لا توجد منتجات تطابق الفلاتر المختارة."
        },
        admin: {
            dashboard: "لوحة تحكم الإدارة",
            backToSite: "عودة للموقع",
            products: "المنتجات",
            orders: "الطلبات",
            bundleMaker: "صانع المجموعات",
            users: "المستخدمين",
            analytics: "التحليلات",
            settingsNav: "الإعدادات",
            addProduct: "إضافة منتج",
            createBundle: "إنشاء مجموعة",
            missionAnalytics: "تحليلات المهمة",
            realTimeIntel: "معلومات فورية عن أداء المتجر.",
            table: {
                product: "المنتج",
                category: "القسم",
                price: "السعر",
                orderId: "رقم الطلب",
                customer: "العميل",
                items: "عناصر",
                status: "الحالة",
                date: "التاريخ",
                bundleName: "اسم المجموعة",
                email: "البريد الإلكتروني",
                phone: "الهاتف",
                role: "الدور",
                joined: "تاريخ الانضمام"
            },
            status: {
                processing: "قيد التجهيز",
                shipped: "تم الشحن",
                delivered: "تم التوصيل",
                cancelled: "ملغي",
                cancellation_requested: "طلب إلغاء",
                approve_cancel: "قبول الإلغاء"
            },
            analyticsLabels: {
                totalVisits: "إجمالي الزيارات",
                uniqueVisitors: "زوار فريدين",
                registeredOperatives: "عملاء مسجلين",
                squadronRecruits: "مشتركي النشرة",
                totalRevenue: "إجمالي الإيرادات",
                conversionRate: "معدل التحويل",
                avgOrderValue: "متوسط الطلب",
                recentRecruits: "أحدث المشتركين",
                trafficIntel: "بيانات الزيارات (آخر 30 يوم)"
            },
            empty: {
                products: "لم يتم العثور على منتجات. قم بتشغيل بذر SQL!",
                orders: "لا توجد طلبات بعد",
                bundles: "لم يتم العثور على حزم. أنشئ واحدة!",
                traffic: "لا توجد بيانات حركة مرور مسجلة بعد.",
                recruits: "لا توجد مجندين بعد."
            },
            actions: {
                demote: "تخفيض الرتبة",
                makeAdmin: "تعيين كمسؤول",
                deleteUser: "حذف المستخدم",
                confirmDelete: "هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء.",
                confirmDeleteUser: "هل أنت متأكد؟ سيؤدي هذا إلى حذف تسجيل دخول المستخدم وبياناته نهائيًا.",
                confirmApproveCancel: "هل أنت متأكد أنك تريد الموافقة على هذا الإلغاء؟ سيتم حذف الطلب نهائيًا وإخطار المستخدم."
            },
            settings: {
                manageProfile: "إدارة ملفي الشخصي",
                manageProfileDesc: "لإدارة اسم المستخدم والعنوان وصورة الملف الشخصي، قم بزيارة لوحة التحكم الشخصية الخاصة بك."
            }
        },
        home: {
            featured: "مميز",
            gear: "معدات",
            description: "معدات احترافية يستخدمها أفضل رياضيي الرياضات الإلكترونية في العالم. صممت بدون تنازلات.",
            viewAll: "عرض كل المنتجات",
            joinTitle: "انضم إلى فريق RECOIL",
            joinDesc: "سجل للحصول على وصول مبكر للإصدارات المحدودة وفعاليات المحترفين الحصرية."
        },
        newsletter: {
            placeholder: "أدخل بريدك الإلكتروني",
            button: "اشترك",
            subscribing: "جاري الاشتراك...",
            success: "أهلاً بك في الفريق! تفقد بريدك الإلكتروني.",
            error: "حدث خطأ ما. حاول مرة أخرى."
        },
        footer: {
            links: "روابط سريعة",
            legal: "قانوني",
            social: "تابعنا",
            newsletter: "انضم إلى الفريق",
            rights: "جميع الحقوق محفوظة."
        },
        product: {
            backToShop: "العودة للمتجر",
            inStock: "متوفر",
            quantity: "الكمية",
            includedInBundle: "محتويات المجموعة",
            addToCart: "أضف للعربة",
            freeShipping: "شحن مجاني",
            warranty: "ضمان لمدة سنتين",
            secureCheckout: "دفع آمن",
            egp: "جنيه"
        }
    }
}
