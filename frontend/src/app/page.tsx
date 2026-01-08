import Link from "next/link";
import { medusa } from "@/lib/medusa";
import { ProductCard } from "@/components/products/product-card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Package, MessageSquare, Workflow, ShieldCheck, Truck } from "lucide-react";

async function getFeaturedProducts() {
  try {
    const { products } = await medusa.store.product.list({
      limit: 8,
    });
    return products;
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export default async function HomePage() {
  const products = await getFeaturedProducts();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDQwIEwgNDAgNDAgNDAgMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />

        <div className="container relative py-20">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6 animate-fade-in">
              <Workflow className="h-4 w-4" />
              <span>Workflow-Powered Commerce</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] animate-fade-in-up">
              Shop Smarter with
              <span className="block mt-2 bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                Real-Time Tracking
              </span>
            </h1>
            
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              Experience the future of e-commerce. Watch your order progress through every 
              stage with our Camunda-powered workflow orchestration.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row items-start gap-4 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <Link href="/products">
                <Button size="lg" className="btn-primary bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-12 text-base font-semibold shadow-glow-sm hover:shadow-glow transition-all">
                  Browse Collection
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="border-border hover:bg-muted/50 h-12 px-8 text-base">
                  Create Account
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              {[
                { value: "4", label: "Workflow Steps" },
                { value: "100%", label: "Transparency" },
                { value: "24/7", label: "Tracking" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-secondary/30">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-muted-foreground">
              Built with modern technology stack for the best shopping experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: "Real-Time Updates",
                description: "Track your order through payment verification, inventory reservation, and completion - all in real-time.",
                color: "primary",
              },
              {
                icon: ShieldCheck,
                title: "Secure Payments",
                description: "Enterprise-grade security with Stripe integration for safe and seamless transactions.",
                color: "accent",
              },
              {
                icon: MessageSquare,
                title: "Slack Notifications",
                description: "Get instant updates on your order status directly in your Slack workspace.",
                color: "success",
              },
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="group relative p-8 rounded-2xl bg-background border border-border hover:border-primary/50 transition-all duration-300 card-hover"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`inline-flex h-14 w-14 items-center justify-center rounded-xl mb-6 transition-transform duration-300 group-hover:scale-110 ${
                  feature.color === "primary" ? "bg-primary/10 text-primary" :
                  feature.color === "accent" ? "bg-accent/10 text-accent" :
                  "bg-success/10 text-success"
                }`}>
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Preview Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        
        <div className="container relative">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Transparent Order Journey
            </h2>
            <p className="text-muted-foreground">
              Watch your order progress through each stage of our automated workflow
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Connection line */}
              <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2" />
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4">
                {[
                  { step: 1, icon: Package, title: "Order Received", status: "Your order enters our system" },
                  { step: 2, icon: ShieldCheck, title: "Payment Verified", status: "Secure payment confirmation" },
                  { step: 3, icon: Truck, title: "Items Reserved", status: "Inventory allocated" },
                  { step: 4, icon: Zap, title: "Complete", status: "Ready for shipping" },
                ].map((item, index) => (
                  <div key={item.step} className="relative flex flex-col items-center text-center">
                    <div className={`relative z-10 h-16 w-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${
                      index === 0 
                        ? "bg-accent text-accent-foreground shadow-lg shadow-accent/20" 
                        : "bg-muted text-muted-foreground"
                    }`}>
                      <item.icon className="h-7 w-7" />
                      {index === 0 && (
                        <div className="absolute inset-0 rounded-2xl bg-accent/50 blur-lg" />
                      )}
                    </div>
                    <span className="text-xs font-medium text-primary mb-1">Step {item.step}</span>
                    <h4 className="font-semibold mb-1">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">{item.status}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-24 bg-secondary/30">
        <div className="container">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Featured Products
              </h2>
              <p className="text-muted-foreground mt-2">
                Discover our curated collection
              </p>
            </div>
            <Link href="/products">
              <Button variant="outline" className="group">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 rounded-2xl bg-background border border-dashed border-border">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                No products available yet. Add some products in the Medusa admin!
              </p>
              <Button variant="outline" asChild>
                <a href="http://localhost:9000/app" target="_blank" rel="noopener noreferrer">
                  Open Admin Dashboard
                </a>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
        
        <div className="container relative text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Ready to Experience the Future?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of customers enjoying transparent, workflow-powered shopping.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="btn-primary bg-primary hover:bg-primary/90 px-8 h-12 text-base font-semibold shadow-glow-sm hover:shadow-glow transition-all">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/products">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                Explore Products
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
