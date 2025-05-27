import { Button } from "@repo/ui/components/button";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-gray-100 pt-10 border-gray-200">
      {/* Top section with logo and buttons */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Image src="/logo.avif" alt="logo" width={100} height={100} />

            {/* Right side buttons */}
            <div className="flex items-center space-x-4">
              <div className="text-right text-sm text-gray-600">
                <div>For 18 years and</div>
                <div>above only</div>
              </div>
              <Button variant="outline" className="text-black border-gray-300">
                Download App
              </Button>
              <Button className="bg-black text-white hover:bg-gray-800">
                Trade Online
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Company */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Culture
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Help Centre
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Contact Support
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  What's New
                </a>
              </li>
            </ul>
          </div>

          {/* Careers */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Careers</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Open Roles
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:help@probo.in"
                  className="text-gray-600 hover:text-gray-900"
                >
                  help@probo.in
                </a>
              </li>
              <li>
                <a
                  href="mailto:communication@probo.in"
                  className="text-gray-600 hover:text-gray-900"
                >
                  communication@probo.in
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Partnerships section */}
        <div className="border-t border-gray-200 pt-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="max-w-2xl">
              <h3 className="font-bold text-gray-900 mb-4">
                Probo Partnerships
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Probo's experience is made possible by our partnerships with{" "}
                <strong>Authbridge</strong> for verification technology,{" "}
                <strong>Palantir</strong> for data & analytics,{" "}
                <strong>Google Firebase</strong>,{" "}
                <strong>Google Cloud & AWS</strong>. Probo is also a member of{" "}
                <strong>FICCI</strong> and <strong>ASSOCHAM</strong>.
              </p>
            </div>

            {/* Partner logos */}
            <div className="flex items-center gap-4 ml-8">
              <Image
                src="/trading-view.avif"
                alt="authbridge"
                width={50}
                height={50}
              />

              <Image
                src="/authbridge.avif"
                alt="authbridge"
                width={50}
                height={50}
              />
              <Image
                src="/datamuni.avif"
                alt="authbridge"
                width={50}
                height={50}
              />
              <Image
                src="/google-cloud.avif"
                alt="firebase"
                width={50}
                height={50}
              />
              <Image src="/google-firebase.avif" alt="firebase" width={50} height={50} />
            </div>
          </div>
        </div>

        {/* Social media links */}
        <div className="flex justify-center space-x-6 mb-8">
          <a
            href="#"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <Image src="/linkedin.avif" alt="linkedin" width={40} height={40} />
          </a>
          <a
            href="#"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <Image src="/x.avif" alt="twitter" width={40} height={40} />
          </a>
          <a
            href="#"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <Image
              src="/instagram.avif"
              alt="instagram"
              width={40}
              height={40}
            />
          </a>
          <a
            href="#"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <Image src="/youtube.avif" alt="youtube" width={40} height={40} />
          </a>
        </div>

        {/* Bottom links and copyright */}
        <div className="border-t border-gray-200 pt-6 flex items-center justify-between">
          <div className="flex space-x-6">
            <a href="#" className="text-gray-600 hover:text-gray-900 text-sm">
              Terms and Conditions
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 text-sm">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 text-sm">
              Legality
            </a>
          </div>
          <div className="text-gray-600 text-sm">
            © copyright 2025 by Probo Media Technologies Pvt. Ltd.
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="border-t border-gray-200 bg-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h4 className="font-bold text-gray-900 mb-2">Disclaimer</h4>
          <p className="text-gray-600 text-sm">
            This game may be habit forming or financially risky. Play
            responsibly. 18+ only.
          </p>
        </div>
      </div>
    </footer>
  );
}
