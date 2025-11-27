import React from 'react';
import { Helmet } from 'react-helmet-async';

const AboutPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>关于我们 - WSNAIL.COM</title>
        <meta name="description" content="了解WSNAIL.COM背后的故事。我们致力于为您发现和评测最新、最有趣的AI工具，助您探索人工智能的无限可能。" />
      </Helmet>
      <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl">
              关于 WSNAIL.COM
            </h1>
          </header>
          <main className="prose prose-lg dark:prose-invert mx-auto">
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">我们的使命</h2>
              <p>在这个AI技术日新月异的时代，我们致力于成为您最信赖的AI工具���航站。我们的使命是为您发现、评测并精选出全球范围内最新、最有趣的AI工具，帮助您节省时间，激发创造力，探索人工智能的无限可能。</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-8">认识站长</h2>
              <div className="flex flex-col sm:flex-row items-center gap-8 bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
                <img
                  src="/images/avatar-placeholder.png"
                  alt="wsnail (王蜗牛) 头像"
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-blue-500 dark:ring-blue-400"
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">王蜗牛 (wsnail)</h3>
                  <p className="mt-2">和蜗牛一样，我相信专注和持续的努力，最终能抵达想去的地方——哪怕起点微不足道。</p>
                  <p className="mt-2">2023年，AI的浪潮席卷而来，我像个在信息海洋里迷航的水手，每天被无数新工具的信息淹没。哪些是真正的效率神器？哪些只是昙花一现的噱头？</p>
                  <p className="mt-2">WSNAIL.COM 就诞生于这个简单的初衷：我想为自己，也为和我有同样困惑的朋友们，创建一个清晰、可靠的AI工具导航地图。这里的每一个工具，我都尽可能亲自试用，并用最直白的方式分享我的使用感受。</p>
                  <p className="mt-2">感谢你的到访，希望你在这里能找到让你眼前一亮的工具。AI之路，我们一起慢慢走。</p>
                  <div className="mt-4 flex space-x-4">
                    <a href="https://github.com/Wang-snail" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">GitHub</a>
                    <a href="https://twitter.com/wsnail" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Twitter</a>
                    <span className="text-gray-600 dark:text-gray-400">微信: Reaper-B</span>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </>
  );
};

export default AboutPage;
