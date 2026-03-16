import React, { useEffect, useState } from 'react';
import { Tag, Layers, Wrench, Info, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { useLang } from '../contexts/LanguageContext';
import { getUiText } from '../lib/uiText';
import type { PricingRule, ServiceFee } from '../types';

const MATERIAL_COLORS: Record<string, string> = {
  PLA: '#22c55e',
  PETG: '#3b82f6',
  TPU: '#a855f7',
  ABS: '#f97316',
};

export const PricingPage: React.FC = () => {
  const { lang, t } = useLang();
  const copy = getUiText(lang);
  const [pricing, setPricing] = useState<PricingRule[]>([]);
  const [fees, setFees] = useState<ServiceFee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getPricing(), api.getServiceFees()])
      .then(([p, f]) => {
        setPricing(p);
        setFees(f);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="app-student-squared flex items-center justify-center py-20 text-slate-500 dark:text-[var(--landing-muted)]">
        <Loader2 size={24} className="mr-2 animate-spin" /> {t('loadingPricing')}
      </div>
    );
  }

  return (
    <div className="app-student-squared mx-auto max-w-5xl space-y-6 sm:space-y-8">
      <section className="app-panel app-hover-box p-6 sm:p-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
          <div className="space-y-4">
            <p className="app-eyebrow">// {t('pricing')}</p>
            <div className="space-y-3">
              <h2 className="app-display-sm text-slate-900 dark:text-[var(--landing-text)]">
                {t('pricingTitle')}
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-slate-600 dark:text-[var(--landing-muted)]">
                {t('pricingDesc')}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="app-panel-soft border p-5">
              <p className="app-overline">{t('activeMaterials')}</p>
              <p className="mt-3 text-3xl font-black text-slate-900 dark:text-[var(--landing-text)]">{pricing.length}</p>
              <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-[var(--landing-muted)]">
                {t('activeMaterialsDesc')}
              </p>
            </div>
            <div className="app-panel-soft border p-5">
              <p className="app-overline">{t('extraFees')}</p>
              <p className="mt-3 text-3xl font-black text-slate-900 dark:text-[var(--landing-text)]">{fees.length}</p>
              <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-[var(--landing-muted)]">
                {t('extraFeesDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Layers size={18} className="text-[var(--landing-accent)]" />
          <h3 className="app-overline text-slate-700 dark:text-[var(--landing-muted)]">{t('pricePerGramTitle')}</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {pricing.map((rule: PricingRule) => (
            <article
              key={rule.material}
              className="app-panel app-hover-box grid gap-4 border p-5 sm:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center border text-sm font-black text-white"
                    style={{ background: MATERIAL_COLORS[rule.material] || '#64748b' }}
                  >
                    {rule.material}
                  </div>
                  <div>
                    <p className="app-overline">{t('materialLabel')}</p>
                    <h4 className="mt-2 text-lg font-black text-slate-900 dark:text-[var(--landing-text)]">{rule.material}</h4>
                  </div>
                </div>
                <div className="text-right">
                  <p className="app-overline">{t('unitPriceLabel')}</p>
                  <p
                    className="mt-2 text-2xl font-black"
                    style={{ color: MATERIAL_COLORS[rule.material] || '#64748b' }}
                  >
                    {Number(rule.pricePerGram).toLocaleString(lang === 'VN' ? 'vi-VN' : 'en-US')}{lang === 'VN' ? 'đ' : ' VND'}
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-slate-400 dark:text-white/38">{t('perGram')}</p>
                </div>
              </div>
              <p className="text-sm leading-7 text-slate-600 dark:text-[var(--landing-muted)]">
                {(copy as any).materialDesc?.[rule.material] || ''}
              </p>
            </article>
          ))}
        </div>
      </section>

      {fees.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Wrench size={18} className="text-[var(--landing-accent)]" />
            <h3 className="app-overline text-slate-700 dark:text-[var(--landing-muted)]">{t('serviceFeesTitle')}</h3>
          </div>
          <div className="app-panel app-hover-box overflow-hidden border">
            {fees.map((fee: ServiceFee, i: number) => (
              <div
                key={fee.name}
                className={`grid gap-3 px-5 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-6 ${i < fees.length - 1 ? 'border-b border-[rgba(30,23,19,0.08)] dark:border-white/8' : ''
                  }`}
              >
                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-[var(--landing-text)]">{fee.label}</p>
                  {fee.description && (
                    <p className="mt-1 text-xs leading-6 text-slate-500 dark:text-[var(--landing-muted)]">{fee.description}</p>
                  )}
                </div>
                <span className={`text-sm font-black uppercase tracking-[0.16em] ${fee.amount === 0 ? 'text-emerald-600 dark:text-emerald-300' : 'text-[var(--landing-accent-strong)]'
                  }`}>
                  {fee.amount === 0 ? t('free') : `${Number(fee.amount).toLocaleString(lang === 'VN' ? 'vi-VN' : 'en-US')}${lang === 'VN' ? 'đ' : ' VND'}`}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="app-panel-soft app-hover-box border p-5 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[auto_minmax(0,1fr)]">
          <div className="flex h-12 w-12 items-center justify-center border bg-[rgba(239,125,87,0.12)] text-[var(--landing-accent-strong)]">
            <Tag size={18} />
          </div>
          <div>
            <p className="app-eyebrow">{t('calculationMethod')}</p>
            <h4 className="mt-2 text-lg font-black text-slate-900 dark:text-[var(--landing-text)]">{t('estimateTitle')}</h4>
            <div className="mt-4 grid gap-3 text-sm leading-7 text-slate-600 dark:text-[var(--landing-muted)]">
              <p><strong>{t('materialCostLabel')}</strong> = {t('materialCostFormula')}</p>
              <p><strong>{t('total')}</strong> = {t('totalCostFormula')}</p>
              <p>{t('finalWeightNote')}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="app-panel-soft border px-5 py-4">
        <div className="flex items-start gap-3 text-sm text-slate-600 dark:text-[var(--landing-muted)]">
          <Info size={16} className="mt-0.5 shrink-0 text-[var(--landing-accent)]" />
          <p>{t('policyNote')}</p>
        </div>
      </div>
    </div>
  );
};
