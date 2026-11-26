import { CheckoutForm } from "@/components/storefront/checkout-form";

export const metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-5xl tracking-wide">Checkout</h1>
      <p className="mt-2 text-muted">
        Guest checkout is fine — or sign in with Google if configured.
      </p>
      <div className="mt-10">
        <CheckoutForm />
      </div>
    </div>
  );
}
