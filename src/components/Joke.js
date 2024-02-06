import { Accordion, AccordionItem, Chip } from '@nextui-org/react';
import { useTranslation } from 'react-i18next';
import { Comment } from './Comment';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { IssueModal } from './IssueModal';
import { useAuth } from '../lib/useAuth';

export const Issue = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
  
    return (
      <>
      </>
    )
}