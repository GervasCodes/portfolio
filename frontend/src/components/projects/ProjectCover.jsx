import PlaceholderArt from '@/components/ui/PlaceholderArt';
import ProgressiveImage from '@/components/ui/ProgressiveImage';

/**
 * Cover for cards and rows. A real image when the project has one; otherwise
 * abstract art generated from the title (same title = same art), so a card is
 * never a blank box. Fixed 16:10 box, so nothing moves when the image loads.
 */
export default function ProjectCover({ project, className = '', eager = false, imgClassName = '' }) {
  return (
    <div className={`relative aspect-[16/10] w-full overflow-hidden bg-surface-2 ${className}`}>
      {project.cover_image_url ? (
        <ProgressiveImage
          src={project.cover_image_url}
          width="1600"
          height="1000"
          priority={eager}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className={`absolute inset-0 h-full w-full object-cover object-top ${imgClassName}`}
        />
      ) : (
        <PlaceholderArt seed={project.slug || project.title || 'project'} className="absolute inset-0 h-full w-full" />
      )}
    </div>
  );
}
