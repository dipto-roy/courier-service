import Link from 'next/link';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Company info */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Courier Service</h3>
            <p className="text-sm text-muted-foreground">
              Fast, reliable, and secure courier services across Bangladesh.
            </p>
            <div className="flex gap-2">
              <Link
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-muted hover:bg-muted/80"
              >
                <Facebook className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-muted hover:bg-muted/80"
              >
                <Twitter className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-muted hover:bg-muted/80"
              >
                <Instagram className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-foreground">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-foreground">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-foreground">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/contact" className="hover:text-foreground">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-foreground">
                  Track Shipment
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Contact</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+880 1234-567890</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>info@courier.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Dhaka, Bangladesh</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Courier Service. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
