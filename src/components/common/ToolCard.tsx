import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';

interface ToolCardProps {
    icon?: React.ReactNode;
    name: string;
    description: string;
    link: string;
    hot?: boolean;
}

export default function ToolCard({ icon, name, description, link, hot }: ToolCardProps) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden group"
        >
            {hot && (
                <div className="absolute top-0 right-0 bg-red-50 text-red-600 text-xs font-medium px-2 py-1 rounded-bl-lg">
                    HOT
                </div>
            )}

            <div className="flex items-start justify-between mb-4">
                <div className="bg-blue-50 p-3 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    {icon || <Star className="w-6 h-6" />}
                </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2 truncate" title={name}>
                {name}
            </h3>

            <p className="text-gray-600 text-sm mb-6 line-clamp-2 h-10">
                {description}
            </p>

            <Link to={link}>
                <Button className="w-full bg-gray-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-100 group-hover:border-transparent transition-all duration-300">
                    立即使用
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </Link>
        </motion.div>
    );
}
