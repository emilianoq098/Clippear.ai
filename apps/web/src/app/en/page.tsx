import Landing from '../../components/Landing';

export const metadata = {
  title: 'Clipper — Find the best in any video',
  description: 'Find the best moments, edit clips, and turn photos into videos.',
  openGraph: { title: 'Clipper — Find the best in any video', locale: 'en_US' },
};

export default function EnglishHome() {
  return <Landing lang="en" />;
}
