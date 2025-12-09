import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import ToolCard from '../components/common/ToolCard';
import { dataService } from '../services/dataService';
import { AITool } from '../types';

export default function HomePageOptimized() {
  const { t } = useTranslation();
  const [tools, setTools] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTools = async () => {
      try {
        setLoading(true);
        const allTools = await dataService.loadAITools('normal');
        setTools(allTools);
      } catch (error) {
        console.error('Failed to load tools:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero Section */}
      <section className="relative pt-12 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-3xl"
        >
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            {t('home.title')}
          </h1>
        </motion.div>
      </section>

      {/* Tools Grid */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-24">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-2 text-gray-600">{t('home.loading')}</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Featured Tool: Sales Target Tracking */}
              <ToolCard
                name={t('home.tools.salesTarget.name')}
                description={t('home.tools.salesTarget.desc')}
                link="/sales-target"
                hot={true}
                icon={<span className="text-2xl">💰</span>}
              />
              {tools.map((tool, index) => (
                <ToolCard
                  key={tool.id || index}
                  name={tool.name}
                  description={tool.description}
                  link={tool.link || '#'}
                  hot={tool.hot || tool.hot_score > 85}
                  icon={null}
                />
              ))}
            </div>

            {tools.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                {t('home.noResults')}
              </div>
            )}
          </>
        )}
      </section>

      {/* Footer CTA */}
      <section className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('home.bottomCta.title')}</h2>
          <p className="text-gray-600 mb-6">{t('home.bottomCta.desc')}</p>
          <div className="flex justify-center gap-4">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg h-auto"
              onClick={() => window.location.href = '/email-contact'}
            >
              {t('home.bottomCta.contact')}
            </Button>
            <Button
              variant="outline"
              className="px-8 py-4 rounded-xl text-lg h-auto border-blue-200 text-blue-600 hover:bg-blue-50"
              onClick={() => window.location.href = '/discussion'}
            >
              {t('home.bottomCta.community')}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}