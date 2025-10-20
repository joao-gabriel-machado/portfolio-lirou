import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Github, Calendar, MapPin } from 'lucide-react';

export interface CardItemProps {
  title: string;
  subtitle?: string;
  description: string;
  period?: string;
  location?: string;
  technologies?: string[];
  image?: string;
  githubUrl?: string;
  liveUrl?: string;
  featured?: boolean;
}

const CardItem = ({
  title,
  subtitle,
  description,
  period,
  location,
  technologies = [],
  image,
  githubUrl,
  liveUrl,
  featured = false,
}: CardItemProps) => {
  return (
    <Card className="group glass border-border hover:border-primary/30 transition-smooth hover-lift overflow-hidden">
      {image && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-smooth group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent opacity-60" />
        </div>
      )}
      
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1">
            <h3 className={`font-semibold text-foreground transition-smooth group-hover:text-primary ${
              featured ? 'text-xl' : 'text-lg'
            }`}>
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-muted-foreground font-medium">
                {subtitle}
              </p>
            )}
          </div>
          
          {(githubUrl || liveUrl) && (
            <div className="flex gap-2">
              {githubUrl && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 hover:text-primary transition-smooth"
                  onClick={() => window.open(githubUrl, '_blank')}
                >
                  <Github className="w-4 h-4" />
                </Button>
              )}
              {liveUrl && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 hover:text-accent transition-smooth"
                  onClick={() => window.open(liveUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>

        {(period || location) && (
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {period && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{period}</span>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{location}</span>
              </div>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>

        {technologies.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {technologies.map((tech, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs px-2 py-0.5 bg-secondary/50 hover:bg-secondary transition-smooth"
              >
                {tech}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CardItem;
