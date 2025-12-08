import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Users, TrendingUp, CheckCircle } from 'lucide-react';

export default function LazySocialProof() {
  const testimonials = [
    {
      name: "亚马逊资深卖家",
      role: "5年跨境电商经验",
      content: "WSNAIL的AI选品工具帮我找到了3个爆款产品，月销售额提升了300%",
      avatar: "👨‍💼"
    },
    {
      name: "DTC品牌主理人",
      role: "独立站运营",
      content: "营销文案生成工具节省了我70%的时间，转化率提升了25%",
      avatar: "👩‍💼"
    },
    {
      name: "跨境营销专家",
      role: "数据分析师",
      content: "数据分析功能让我清楚地了解客户需求，店铺评分从4.2提升到4.8",
      avatar: "👨‍🔧"
    }
  ];

  const achievements = [
    { number: "106+", label: "AI工具" },
    { number: "3000+", label: "用户满意度" },
    { number: "85%", label: "效率提升" },
    { number: "24/7", label: "技术支持" }
  ];

  return (
    <section className="py-20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 成就展示 */}
        <div className="text-center mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {achievement.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {achievement.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 用户评价 */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              用户怎么说
            </h2>
            <p className="text-gray-600">
              真实用户的成功故事
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/80 border border-gray-200 rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white text-xl mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonial.role}
                    </div>
                  </div>
                </div>

                <div className="flex items-start mb-4">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">
                    {testimonial.content}
                  </p>
                </div>

                <div className="flex items-center text-yellow-400">
                  {'★'.repeat(5)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA部分 */}
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="backdrop-blur-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-gray-200 rounded-3xl p-12 shadow-xl"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800 tracking-tight">
              开始你的AI电商之旅
            </h2>
            <p className="text-xl mb-8 text-gray-600 font-light">
              加入1000+电商从业者，使用AI工具提升效率，学习成功经验
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/ai-tools">
                <Button size="lg" className="backdrop-blur-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-xl px-8 py-6 text-lg font-semibold">
                  <Users className="w-5 h-5 mr-2" />
                  免费体验AI选品
                </Button>
              </Link>
              <Link to="/community">
                <Button size="lg" variant="outline" className="backdrop-blur-xl bg-white/50 hover:bg-white/70 border-2 border-gray-300 text-gray-700 shadow-xl px-8 py-6 text-lg font-semibold">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  加入社区
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}