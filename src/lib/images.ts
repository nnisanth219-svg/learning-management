/** Build optimized Unsplash URLs for sharp, cinematic visuals */
export function buildImageUrl(photoId: string, width = 1600, quality = 90) {
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=${width}&q=${quality}`;
}

/** High-quality education imagery — verified Unsplash photo IDs */
export const IMAGES = {
  hero: buildImageUrl('photo-1524178232363-1fb2b075b655', 2560, 95),
  heroAlt: buildImageUrl('photo-1523240795612-9a054b0db644', 2560, 95),
  classroom: buildImageUrl('photo-1427504549704-459812d6064d', 1800, 90),
  onlineLearning: buildImageUrl('photo-1516321318423-f06f85e504b3', 1800, 90),
  corporate: buildImageUrl('photo-1600880292203-757bb62b4baf', 1800, 90),
  certification: buildImageUrl('photo-1567427017947-545c5f8d16ad', 1800, 90),
  trainer: buildImageUrl('photo-1573496359142-b8d87734a5a2', 800, 90),
  student: buildImageUrl('photo-1507003211169-0a1dd7228f2d', 800, 90),
  team: buildImageUrl('photo-1522071820081-009f0129c71c', 1800, 90),
  collaboration: buildImageUrl('photo-1522202176988-66273c2fd55f', 1800, 90),
  laptop: buildImageUrl('photo-1498050108023-c5249f4df085', 1800, 90),
  success: buildImageUrl('photo-1523240795612-9a054b0db644', 1800, 90),
  workshop: buildImageUrl('photo-1509066619255-aa084793e1cc', 1800, 90),
  dataScience: buildImageUrl('photo-1551288049-bebda4e38f71', 1800, 90),
  design: buildImageUrl('photo-1586717791821-3f44a563fa4d', 1800, 90),
  marketing: buildImageUrl('photo-1460925895917-afdab827c52f', 1800, 90),
  cloud: buildImageUrl('photo-1451187580459-43490279c0fa', 1800, 90),
  leadership: buildImageUrl('photo-1552664730-d307ca884978', 1800, 90),
  fallback: buildImageUrl('photo-1522202176988-66273c2fd55f', 1800, 90),
} as const;

/** Category → dedicated course cover image */
export const COURSE_IMAGES: Record<string, string> = {
  Technology: IMAGES.laptop,
  'Data Science': IMAGES.dataScience,
  Leadership: IMAGES.leadership,
  Design: IMAGES.design,
  Business: IMAGES.marketing,
};

export function getCourseImage(category: string, override?: string) {
  return override ?? COURSE_IMAGES[category] ?? IMAGES.fallback;
}

export const TRAINER_PHOTOS = [
  buildImageUrl('photo-1560250097-0b93528c311a', 600, 90),
  buildImageUrl('photo-1573496359142-b8d87734a5a2', 600, 90),
  buildImageUrl('photo-1472099645785-5658abf4ff4e', 600, 90),
  buildImageUrl('photo-1580489944761-15a19d654956', 600, 90),
  buildImageUrl('photo-1519085360753-af0119f7cbe7', 600, 90),
  buildImageUrl('photo-1507003211169-0a1dd7228f2d', 600, 90),
] as const;

export const AVATAR_PHOTOS = {
  jennifer: buildImageUrl('photo-1438761681033-6461ffad8d80', 200, 90),
  michael: buildImageUrl('photo-1500648767791-00dcc994a43e', 200, 90),
  lisa: buildImageUrl('photo-1544005313-94ddf0286df2', 200, 90),
  robert: buildImageUrl('photo-1506794778202-cad84cf45f1d', 200, 90),
  amanda: buildImageUrl('photo-1487412720507-e7ab37603c6f', 200, 90),
} as const;
