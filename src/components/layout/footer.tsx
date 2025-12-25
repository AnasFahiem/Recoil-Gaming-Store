import { Container } from "@/components/ui/container"
import { Logo } from "@/components/ui/logo"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"

const footerLinks = (t: any) => ({
    shop: [
        { name: "Mousepads", href: "/shop/mousepads" },
        { name: "Accessories", href: "/shop/accessories" },
        { name: t.nav.bundles, href: "/shop/bundles" },
    ],
    support: [
        { name: "FAQ", href: "/faq" },
        { name: "Shipping", href: "/shipping" },
        { name: "Returns", href: "/returns" },
        { name: "Care Guide", href: "/care" },
    ],
    legal: [
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
    ],
    social: [
        { name: "Facebook", href: "https://www.facebook.com/profile.php?id=61584124345317" },
        { name: "Instagram", href: "https://www.instagram.com/recoil.gaming_0/" },
        { name: "TikTok", href: "https://www.tiktok.com/@recoil.gaming.0" },
    ],
})

import { cn } from "@/lib/utils"

export function Footer() {
    const { t } = useLanguage()
    const links = footerLinks(t)

    return (
        <footer className={cn(
            "border-t border-brand-white/10 bg-brand-black pt-16 pb-8",
            t.language === 'ar' && "font-cairo font-bold"
        )}>
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
                    <div className="lg:col-span-2">
                        <Logo className="mb-8" />
                        <p className="max-w-xs text-sm text-brand-silver leading-relaxed">
                            {t.hero.description}
                        </p>
                    </div>

                    <div>
                        <h3 className="font-heading font-semibold text-brand-white mb-4 uppercase tracking-wider">{t.nav.shop}</h3>
                        <ul className="space-y-3">
                            {links.shop.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-sm text-brand-silver hover:text-brand-red transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-heading font-semibold text-brand-white mb-4 uppercase tracking-wider">Support</h3>
                        <ul className="space-y-3">
                            {links.support.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-sm text-brand-silver hover:text-brand-red transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-heading font-semibold text-brand-white mb-4 uppercase tracking-wider">{t.footer.social}</h3>
                        <ul className="space-y-3">
                            {links.social.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-sm text-brand-silver hover:text-brand-red transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="border-t border-brand-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-brand-silver/50">
                        &copy; {new Date().getFullYear()} RECOIL Gaming. {t.footer.rights}
                    </p>
                    <div className="flex gap-6">
                        {links.legal.map((link) => (
                            <Link key={link.name} href={link.href} className="text-xs text-brand-silver/50 hover:text-brand-silver transition-colors">
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </Container>
        </footer>
    )
}
