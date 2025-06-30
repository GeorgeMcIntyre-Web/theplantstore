import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/hooks/use-cart";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { items, totalAmount, clearCart } = useCart();
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Call API to create order
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        totalAmount,
      }),
    });
    setLoading(false);
    if (res.ok) {
      setSubmitted(true);
      await clearCart();
      setTimeout(() => router.push("/account/orders"), 2000);
    } else {
      alert("Failed to place order. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Your Cart</CardTitle>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <p>Your cart is empty.</p>
                ) : (
                  <ul className="space-y-2">
                    {items.map((item) => (
                      <li key={item.id} className="flex justify-between">
                        <span>{item.product.name} x {item.quantity}</span>
                        <span>R{Number(item.product.price * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-4 font-semibold flex justify-between">
                  <span>Total:</span>
                  <span>R{Number(totalAmount).toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Shipping Details</CardTitle>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="text-green-600 font-semibold">Order placed! (Mocked)</div>
                ) : (
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" name="name" value={form.name} onChange={handleChange} required />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" name="address" value={form.address} onChange={handleChange} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input id="city" name="city" value={form.city} onChange={handleChange} required />
                      </div>
                      <div>
                        <Label htmlFor="province">Province</Label>
                        <Input id="province" name="province" value={form.province} onChange={handleChange} required />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input id="postalCode" name="postalCode" value={form.postalCode} onChange={handleChange} required />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>{loading ? "Placing Order..." : "Place Order"}</Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 