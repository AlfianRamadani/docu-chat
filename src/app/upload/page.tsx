import { Metadata } from 'next';
import { generateMetadata, pageMetadata } from '@/lib/seo';
import UploadClient from './upload-client';

export const metadata: Metadata = generateMetadata(pageMetadata.upload);

export default function UploadPage() {
  return <UploadClient />;
}
