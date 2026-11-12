import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { SectionHeading } from '../common/SectionHeading';
import './FaqSection.css';

export interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  items: FaqItem[];
}

export const FaqSection: React.FC<FaqSectionProps> = ({ items }) => {
  const { t } = useLanguage();
  // First item open on load by default
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  // Two independent column stacks: even index in col 1, odd index in col 2
  const col1Indices = items.map((_, i) => i).filter((i) => i % 2 === 0);
  const col2Indices = items.map((_, i) => i).filter((i) => i % 2 === 1);

  const renderCard = (idx: number) => {
    const item = items[idx];
    if (!item) return null;
    const isOpen = openIndex === idx;

    return (
      <div
        key={idx}
        className={`dh-faq__card ${isOpen ? 'dh-faq__card--open' : ''}`}
      >
        <button
          type="button"
          className="dh-faq__trigger"
          onClick={() => toggleItem(idx)}
          aria-expanded={isOpen}
          aria-controls={`faq-answer-${idx}`}
          id={`faq-question-${idx}`}
        >
          <span className="dh-faq__question">{item.question}</span>
          <span
            className={`dh-faq__icon-wrapper ${
              isOpen ? 'dh-faq__icon-wrapper--open' : ''
            }`}
            aria-hidden="true"
          >
            {isOpen ? <Minus size={18} /> : <Plus size={18} />}
          </span>
        </button>

        <div
          id={`faq-answer-${idx}`}
          role="region"
          aria-labelledby={`faq-question-${idx}`}
          className={`dh-faq__collapse ${
            isOpen ? 'dh-faq__collapse--open' : ''
          }`}
        >
          <div className="dh-faq__inner">
            <p className="dh-faq__answer">{item.answer}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section
      id="home-faq"
      data-hard-stop="faq"
      className="dh-faq"
      aria-label="Frequently Asked Questions"
    >
      <div className="dh-faq__container">
        {/* Centered Shared Heading & Subtext */}
        <div className="dh-faq__header">
          <SectionHeading
            lead={t('faq_lead') || 'Frequently asked'}
            accent={t('faq_accent') || 'questions'}
            align="center"
          />
          <p className="dh-faq__subtext">
            {t('faq_sub') ||
              'Short answers about how we work, what it costs and what happens next.'}
          </p>
        </div>

        {/* Two Independent Column Stacks */}
        <div className="dh-faq__grid">
          <div className="dh-faq__column">
            {col1Indices.map((idx) => renderCard(idx))}
          </div>
          <div className="dh-faq__column">
            {col2Indices.map((idx) => renderCard(idx))}
          </div>
        </div>
      </div>
    </section>
  );
};
