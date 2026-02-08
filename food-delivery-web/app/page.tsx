import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-20 md:py-32 lg:py-48 overflow-hidden bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-800 text-white">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

          <div className="container px-6 md:px-12 lg:px-24 max-w-6xl mx-auto relative z-10 h-full flex items-center">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center w-full justify-items-center">
              <div className="flex flex-col justify-center space-y-6 text-center items-center lg:text-left lg:items-start">
                <div className="inline-block rounded-full bg-white/10 px-3 py-1 text-sm font-medium backdrop-blur-sm border border-white/20 text-yellow-300">
                  Hungry? We got you.
                </div>
                <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl leading-tight text-white">
                  Make your <span className="text-yellow-400">healthy day</span> with FoodDelivery
                </h1>
                <p className="max-w-[600px] text-purple-100 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Order your favorite meals from the best restaurants in town. Fast delivery, hot food, and great prices to satisfy your cravings.
                </p>
                <div className="flex flex-col gap-4 min-[400px]:flex-row pt-4">
                  <Link href="/products">
                    <Button size="lg" className="bg-yellow-400 text-purple-900 hover:bg-yellow-300 font-bold border-none rounded-full shadow-lg flex items-center px-8 h-12 text-base">
                      Order Now
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="ml-2 w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="outline" size="lg" className="border-white text-purple-700 bg-white/90 hover:bg-white hover:text-purple-900 font-semibold rounded-full shadow-lg px-8 h-12 text-base">
                      Sign Up
                    </Button>
                  </Link>
                </div>

                {/* Stats / Social Proof */}
                <div className="pt-6 flex items-center gap-4 text-sm font-medium">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`w-10 h-10 rounded-full border-2 border-purple-600 bg-gray-200 flex items-center justify-center text-xs text-gray-600 bg-[url('https://i.pravatar.cc/100?img=${i + 10}')] bg-cover`} />
                    ))}
                  </div>
                  <div>
                    <div>
                      <span className="text-yellow-400 font-bold">4.8</span>
                      <span className="mx-1">/</span>
                      <span>5.0 Rating</span>
                    </div>
                    <div className="text-purple-200 text-xs font-normal">from 500+ reviews</div>
                  </div>
                </div>
              </div>

              {/* Hero Image Placeholder - mimicking the Petuk glass card/food look */}
              <div className="relative flex items-center justify-center lg:justify-end w-full mt-8 lg:mt-0">
                <div className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl flex items-center justify-center p-8 transform hover:scale-105 transition-transform duration-500">
                  <div className="absolute -top-12 -left-12 bg-white/20 backdrop-blur-lg p-5 rounded-3xl border border-white/30 shadow-lg animate-bounce duration-[3000ms] flex flex-col items-center">
                    <span className="text-4xl">🥗</span>
                    <span className="font-bold text-sm mt-1">Fresh Salad</span>
                  </div>
                  <div className="absolute -bottom-8 -right-8 bg-white/20 backdrop-blur-lg p-5 rounded-3xl border border-white/30 shadow-lg animate-bounce duration-[2500ms] flex flex-col items-center">
                    <span className="text-4xl">🍔</span>
                    <span className="font-bold text-sm mt-1">Tasty Burger</span>
                    <div className="text-xs mt-1 text-yellow-300">⭐⭐⭐⭐⭐</div>
                  </div>
                  <div className="text-center text-white/90">
                    <span className="text-8xl block mb-6 filter drop-shadow-lg">🥡</span>
                    <p className="font-bold text-2xl">Delicious food<br />served hot</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-16 md:py-24 bg-purple-50">
          <div className="container px-6 md:px-12 lg:px-24 max-w-6xl mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700">
                Why Choose Us
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-purple-900">
                Our Best Services
              </h2>
              <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                We provide the best food delivery experience with premium quality and service.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: 'Fast Delivery', icon: '🚀', desc: 'Get your food delivered in less than 30 minutes.' },
                { title: 'Fresh Food', icon: '🥗', desc: 'We serve food made from the freshest ingredients.' },
                { title: 'Easy Order', icon: '📱', desc: 'Order food with just a few clicks on our website.' },
              ].map((feature, i) => (
                <div key={i} className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-3xl group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-gray-900">{feature.title}</h3>
                  <p className="text-gray-500">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full border-t bg-purple-950 text-white/70">
        <div className="container mx-auto px-6 md:px-12 lg:px-24 max-w-6xl flex flex-col gap-2 sm:flex-row py-8 items-center w-full">
          <p className="text-xs">© 2026 FoodDelivery. All rights reserved.</p>
          <nav className="sm:ml-auto flex gap-4 sm:gap-6">
            <Link className="text-xs hover:text-white hover:underline underline-offset-4" href="#">
              Terms of Service
            </Link>
            <Link className="text-xs hover:text-white hover:underline underline-offset-4" href="#">
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
