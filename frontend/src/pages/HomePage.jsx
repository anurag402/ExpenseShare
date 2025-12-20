import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaUsers,
  FaWallet,
  FaStar,
  FaCheck,
  FaArrowRight,
  FaLightbulb,
  FaShieldAlt,
  FaBolt,
  FaSmile,
  FaChartLine,
  FaDollarSign,
  FaCheckCircle,
  FaUserGraduate,
  FaPlane,
  FaLaptopCode,
} from "react-icons/fa";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5 },
  },
};

export default function HomePage() {
  const features = [
    {
      icon: FaUsers,
      title: "Group Management",
      description: "Create unlimited groups and invite friends easily",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: FaWallet,
      title: "Smart Tracking",
      description: "Automatically track who owes what to whom",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: FaBolt,
      title: "Instant Settlement",
      description: "Settle balances instantly with one click",
      color: "from-pink-500 to-pink-600",
    },
    {
      icon: FaShieldAlt,
      title: "Secure & Private",
      description: "Your data is encrypted and never shared",
      color: "from-green-500 to-green-600",
    },
  ];

  const benefits = [
    "No more awkward money conversations",
    "Split bills equally or by custom amounts",
    "Support for multiple split types",
    "Real-time balance updates",
    "Payment history and receipts",
    "Mobile-friendly interface",
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "College Student",
      text: "ExpenseShare made splitting rent and groceries so easy! No more confusion.",
      avatar: FaUserGraduate,
    },
    {
      name: "Mike Chen",
      role: "Travel Enthusiast",
      text: "Perfect for tracking expenses on group trips. Everyone knows exactly what they owe.",
      avatar: FaPlane,
    },
    {
      name: "Emma Wilson",
      role: "Event Organizer",
      text: "The best tool for managing group expenses. Highly recommended!",
      avatar: FaLaptopCode,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative py-20 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-3xl -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center mb-16"
          >
            <motion.div variants={itemVariants} className="inline-block mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-400/50 text-blue-300 text-sm font-semibold">
                <FaStar className="text-blue-300" /> Smart Expense Sharing
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6 leading-tight"
            >
              Split Expenses
              <br />
              <span>The Smart Way</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              Stop keeping mental notes of who owes what. ExpenseShare handles
              all the math, tracks every payment, and settles balances
              instantly.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-blue-500/20 border border-blue-500/30 text-blue-300 font-bold rounded-xl hover:bg-blue-500/30 hover:border-blue-400/50 transition-all"
                >
                  Get Started <FaArrowRight />
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <a
                  href="#features"
                  className="inline-flex items-center gap-2 px-8 py-4 border border-gray-400/50 text-gray-300 font-semibold rounded-xl hover:border-gray-300 hover:bg-white/5 transition-all"
                >
                  Learn More
                </a>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Hero Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16"
          >
            {[
              {
                icon: FaUsers,
                label: "50K+ Users",
                desc: "Active users worldwide",
              },
              {
                icon: FaDollarSign,
                label: "$10M+ Split",
                desc: "Total expenses tracked",
              },
              { icon: FaBolt, label: "99.9% Uptime", desc: "Always available" },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  variants={cardVariants}
                  className="p-6 rounded-xl backdrop-blur-sm bg-white/10 border border-white/20 text-center"
                >
                  <Icon className="text-4xl mx-auto mb-3 text-blue-400" />
                  <h3 className="text-2xl font-bold text-white mb-1">
                    {stat.label}
                  </h3>
                  <p className="text-gray-400 text-sm">{stat.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        id="features"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-20"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-300">
              Everything you need to manage shared expenses
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={cardVariants}
                  whileHover={{ y: -8 }}
                  className="group p-8 rounded-2xl backdrop-blur-sm bg-white/10 border border-white/20 hover:border-white/40 transition-all overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity -z-10" />
                  <motion.div
                    className={`text-5xl mb-4 inline-block p-4 rounded-xl bg-gradient-to-br ${feature.color} text-white`}
                    whileHover={{ scale: 1.2, rotate: 10 }}
                  >
                    <Icon />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.section>

      {/* Benefits Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-20 relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 blur-3xl -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Image/Illustration */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/30">
                <FaWallet className="text-6xl text-blue-300" />
              </div>
            </motion.div>

            {/* Right Side - Benefits */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-white mb-8">
                Why Choose ExpenseShare?
              </h2>

              <motion.div className="space-y-4">
                {benefits.map((benefit) => (
                  <motion.div
                    key={benefit}
                    variants={itemVariants}
                    className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all"
                  >
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-500/20 border border-green-400/50">
                        <FaCheck className="text-green-400" size={16} />
                      </div>
                    </div>
                    <p className="text-gray-200">{benefit}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-20"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              What Users Say
            </h2>
            <p className="text-xl text-gray-300">
              Loved by thousands of users worldwide
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial.name}
                variants={cardVariants}
                whileHover={{ y: -8 }}
                className="p-8 rounded-2xl backdrop-blur-sm bg-white/10 border border-white/20 hover:border-white/40 transition-all"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-4xl">{testimonial.avatar}</div>
                  <div>
                    <h4 className="font-bold text-white">{testimonial.name}</h4>
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  "{testimonial.text}"
                </p>
                <div className="flex gap-1 mt-6">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">
                      ★
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-20"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center p-12 rounded-3xl bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-pink-600/30 border border-white/20 backdrop-blur-sm"
          >
            <motion.h2 className="text-4xl font-bold text-white mb-4">
              Ready to simplify expense sharing?
            </motion.h2>
            <motion.p className="text-xl text-gray-300 mb-8">
              Join thousands of users who have already made splitting expenses
              hassle-free
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-10 py-4 bg-blue-500/20 border border-blue-500/30 text-blue-300 font-bold rounded-xl hover:bg-blue-500/30 hover:border-blue-400/50 transition-all text-lg"
                >
                  Start For Free <FaArrowRight />
                </Link>
              </motion.div>
            </motion.div>

            <p className="text-gray-400 text-sm mt-6">
              No credit card required • Free forever for groups up to 5 members
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-12 border-t border-white/10"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2025 ExpenseShare. All rights reserved. | Made with{" "}
            <span className="text-red-400">❤️</span> for friends everywhere
          </p>
        </div>
      </motion.footer>
    </div>
  );
}
