import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import ProjectCards from '@/components/projects/ProjectCards';
import Button from '@/components/ui/Buttons';

export default function Projects({ projects = [] }) {
  return (
    <section id="projects" className="py-24">
      <div className="container-page">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="section-label">Featured Work</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Selected <span className="text-gradient">Projects</span>
            </h2>
          </motion.div>
          <Button href="/projects" variant="secondary" icon={<ArrowRight size={16} />}>
            View All Projects
          </Button>
        </div>

        <ProjectCards projects={projects} />
      </div>
    </section>
  );
}
