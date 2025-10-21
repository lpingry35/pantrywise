import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Lightbulb,
  ListChecks,
  TrendingDown,
  Calendar,
  ChefHat,
  ArrowRight,
  Clock,
  DollarSign,
  Trash2,
  Sparkles
} from 'lucide-react';

function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Smart Meal Planning Made Simple</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-up">
              Plan Smarter,
              <br />
              <span className="text-yellow-300">Shop Less,</span>
              <br />
              Save More 🎉
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl mb-4 text-purple-100 animate-slide-up animation-delay-200">
              Reduce grocery trips, maximize every purchase, and cut your food budget
            </p>

            <p className="text-lg md:text-xl mb-10 text-purple-200 animate-slide-up animation-delay-300">
              One smart meal plan = fewer trips, less waste, more savings
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up animation-delay-400">
              <Link
                to="/meal-planner"
                className="group bg-white text-purple-600 px-8 py-4 rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Start Planning
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/recipes"
                className="group bg-purple-800/50 backdrop-blur-sm text-white px-8 py-4 rounded-full font-semibold text-lg border-2 border-white/30 hover:bg-purple-700/50 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Browse Recipes
                <ChefHat className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Before/After Comparison Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
              The Difference is Clear
            </h2>
            <p className="text-xl text-gray-600">
              See how smart meal planning transforms your grocery routine
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
            {/* Before */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-8 border-2 border-red-200 relative overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Before
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Traditional Shopping</h3>
                <p className="text-gray-600">Shopping for meals one at a time</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <ShoppingCart className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 text-lg">3 grocery trips</div>
                    <div className="text-gray-600 text-sm">Multiple store visits per week</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <DollarSign className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 text-lg">$120 spent</div>
                    <div className="text-gray-600 text-sm">Buying ingredients separately</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 text-lg">40% food waste</div>
                    <div className="text-gray-600 text-sm">Unused ingredients spoil</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <Clock className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 text-lg">4 hours wasted</div>
                    <div className="text-gray-600 text-sm">Time spent shopping + planning</div>
                  </div>
                </div>
              </div>
            </div>

            {/* After */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-300 relative overflow-hidden hover:shadow-xl transition-shadow duration-300 transform hover:scale-105 transition-all">
              <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                After
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Smart Meal Planning</h3>
                <p className="text-gray-600">One trip, shared ingredients, zero waste</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <ShoppingCart className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 text-lg">1 grocery trip</div>
                    <div className="text-gray-600 text-sm">One consolidated shopping list</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 text-lg">$75 spent</div>
                    <div className="text-gray-600 text-sm">Shared ingredients = big savings</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Sparkles className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 text-lg">95% utilization</div>
                    <div className="text-gray-600 text-sm">Every ingredient gets used</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 text-lg">1 hour saved</div>
                    <div className="text-gray-600 text-sm">More time for what matters</div>
                  </div>
                </div>
              </div>

              {/* Savings Badge */}
              <div className="mt-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-4 text-center">
                <div className="text-3xl font-bold">Save $45/week</div>
                <div className="text-sm opacity-90">That's $2,340 per year!</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Four powerful features that transform your meal planning and grocery shopping
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Lightbulb className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Smart Ingredient Matching
              </h3>
              <p className="text-gray-600">
                Automatically find recipes that share ingredients, maximizing every purchase and minimizing waste.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <ChefHat className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Pantry-Based Suggestions
              </h3>
              <p className="text-gray-600">
                Get recipe recommendations based on ingredients you already have at home. Cook smarter, not harder.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <ListChecks className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Consolidated Shopping Lists
              </h3>
              <p className="text-gray-600">
                Generate one organized shopping list for the entire week. Never forget an ingredient again.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
              <div className="bg-gradient-to-br from-orange-500 to-red-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <TrendingDown className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Waste Reduction Tracking
              </h3>
              <p className="text-gray-600">
                See exactly how much food and money you're saving. Track your impact week by week.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Meal Planning?
            </h2>
            <p className="text-xl md:text-2xl mb-10 text-purple-100">
              Join thousands saving time and money with smarter meal planning
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/meal-planner"
                className="group bg-white text-purple-600 px-10 py-5 rounded-full font-bold text-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Get Started Free
                <Calendar className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </Link>

              <Link
                to="/recipes"
                className="bg-purple-800/50 backdrop-blur-sm text-white px-10 py-5 rounded-full font-bold text-xl border-2 border-white/30 hover:bg-purple-700/50 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Explore Recipes
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
