'use client'

import type { Dispatch, FormEvent, SetStateAction } from 'react'

import { SectionTitle } from '@/components/sections/SectionTitle'
import { LabelText } from '@/components/ui/label'
import { Input, Select, Textarea } from '@/components/ui/input'
import { AccountPillButton } from '@/components/account/AccountButtons'

import type { AestheticFolderDraft, FormMessage } from './types'
import styles from './AestheticForm.module.css'

type AestheticFormProps = {
  draft: AestheticFolderDraft
  setDraft: Dispatch<SetStateAction<AestheticFolderDraft>>
  saving: boolean
  message: FormMessage | null
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function AestheticForm({ draft, setDraft, saving, message, onSubmit }: AestheticFormProps) {
  return (
    <>
      <div className={styles.introBlock}>
        <SectionTitle as="h3" size="h3" uppercase className={styles.subHeading}>
          Scheda cliente salone
        </SectionTitle>
        <p className={`${styles.value} typo-body-lg`}>
          Anteprima frontend della cartella estetica: dati utili alle estetiste per trattamento in
          salone, follow-up e raccomandazioni di servizi/prodotti.
        </p>
      </div>

      <form className={styles.aestheticForm} onSubmit={onSubmit}>
        <div className={styles.block}>
          <div className={styles.rowBetween}>
            <SectionTitle as="h3" size="h3" uppercase className={styles.subHeading}>
              Profilo Cutaneo
            </SectionTitle>
            <label className={styles.inlineField}>
              <span className={`${styles.inlineLabel} typo-caption-upper`}>Ultima valutazione</span>
              <Input
                type="date"
                className={`${styles.input} typo-body`}
                value={draft.lastAssessmentDate}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    lastAssessmentDate: event.target.value,
                  }))
                }
              />
            </label>
          </div>

          <div className={styles.grid}>
            <label className={styles.profileField}>
              <LabelText className={styles.label} variant="field">
                Tipo di pelle
              </LabelText>
              <Select
                className={`${styles.select} typo-body`}
                value={draft.skinType}
                onChange={(event) => setDraft((prev) => ({ ...prev, skinType: event.target.value }))}
              >
                <option value="">Seleziona</option>
                <option value="normal">Normale</option>
                <option value="dry">Secca</option>
                <option value="oily">Grassa</option>
                <option value="combination">Mista</option>
                <option value="sensitive">Sensibile</option>
              </Select>
            </label>
            <label className={styles.profileField}>
              <LabelText className={styles.label} variant="field">
                Sensibilita
              </LabelText>
              <Select
                className={`${styles.select} typo-body`}
                value={draft.skinSensitivity}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    skinSensitivity: event.target.value,
                  }))
                }
              >
                <option value="">Seleziona</option>
                <option value="low">Bassa</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </Select>
            </label>
            <label className={styles.profileField}>
              <LabelText className={styles.label} variant="field">
                Fototipo (Fitzpatrick)
              </LabelText>
              <Select
                className={`${styles.select} typo-body`}
                value={draft.fitzpatrick}
                onChange={(event) => setDraft((prev) => ({ ...prev, fitzpatrick: event.target.value }))}
              >
                <option value="">Seleziona</option>
                {['I', 'II', 'III', 'IV', 'V', 'VI'].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </Select>
            </label>
          </div>

          <div className={styles.metricsGrid}>
            {[
              ['hydrationLevel', 'Idratazione %'],
              ['sebumLevel', 'Sebum %'],
              ['elasticityLevel', 'Elasticita %'],
            ].map(([field, label]) => (
              <label key={field} className={styles.profileField}>
                <LabelText className={styles.label} variant="field">
                  {label}
                </LabelText>
                <Input
                  className={`${styles.input} typo-body`}
                  type="number"
                  min="0"
                  max="100"
                  value={draft[field as keyof AestheticFolderDraft] as string}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, [field]: event.target.value }))
                  }
                />
              </label>
            ))}
          </div>

          <div className={styles.toggleRow}>
            {[
              ['acneTendency', 'Tendenza acneica'],
              ['rosaceaTendency', 'Tendenza rosacea'],
              ['hyperpigmentationTendency', 'Tendenza iperpigmentazione'],
            ].map(([field, label]) => (
              <label key={field} className={`${styles.checkboxLabel} typo-caption-upper`}>
                <input
                  type="checkbox"
                  checked={Boolean(draft[field as keyof AestheticFolderDraft])}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, [field]: event.target.checked }))
                  }
                />{' '}
                {label}
              </label>
            ))}
          </div>
        </div>

        <div className={styles.block}>
          <SectionTitle as="h3" size="h3" uppercase className={styles.subHeading}>
            Allergie E Controindicazioni
          </SectionTitle>
          <div className={styles.stack}>
            <label className={styles.profileField}>
              <LabelText className={styles.label} variant="field">
                Allergie note
              </LabelText>
              <Textarea
                className={`${styles.textarea} typo-body`}
                rows={3}
                value={draft.allergies}
                onChange={(event) => setDraft((prev) => ({ ...prev, allergies: event.target.value }))}
                placeholder="Ingredienti, metalli, lattice, profumi..."
              />
            </label>
            <label className={styles.profileField}>
              <LabelText className={styles.label} variant="field">
                Controindicazioni / condizioni cliniche
              </LabelText>
              <Textarea
                className={`${styles.textarea} typo-body`}
                rows={3}
                value={draft.contraindications}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    contraindications: event.target.value,
                  }))
                }
                placeholder="Couperose, dermatiti, isotretinoina, trattamenti recenti..."
              />
            </label>
            <div className={styles.grid}>
              <label className={styles.profileField}>
                <LabelText className={styles.label} variant="field">
                  Farmaci / integratori rilevanti
                </LabelText>
                <Textarea
                  className={`${styles.textarea} typo-body`}
                  rows={3}
                  value={draft.medications}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      medications: event.target.value,
                    }))
                  }
                  placeholder="Es. anticoagulanti, retinoidi, terapia ormonale"
                />
              </label>
              <label className={styles.profileField}>
                <LabelText className={styles.label} variant="field">
                  Gravidanza / allattamento
                </LabelText>
                <Select
                  className={`${styles.select} typo-body`}
                  value={draft.pregnancyOrBreastfeeding}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      pregnancyOrBreastfeeding: event.target.value,
                    }))
                  }
                >
                  <option value="">Seleziona</option>
                  <option value="no">No</option>
                  <option value="pregnancy">Gravidanza</option>
                  <option value="breastfeeding">Allattamento</option>
                </Select>
              </label>
            </div>
          </div>
        </div>

        <div className={styles.block}>
          <SectionTitle as="h3" size="h3" uppercase className={styles.subHeading}>
            Obiettivi, Note E Raccomandazioni
          </SectionTitle>
          <div className={styles.stack}>
            <label className={styles.profileField}>
              <LabelText className={styles.label} variant="field">
                Obiettivi trattamento
              </LabelText>
              <Textarea
                className={`${styles.textarea} typo-body`}
                rows={3}
                value={draft.treatmentGoals}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    treatmentGoals: event.target.value,
                  }))
                }
                placeholder="Luminosita, texture, macchie, rassodamento..."
              />
            </label>
            <label className={styles.profileField}>
              <LabelText className={styles.label} variant="field">
                Routine domiciliare
              </LabelText>
              <Textarea
                className={`${styles.textarea} typo-body`}
                rows={3}
                value={draft.homeCareRoutine}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    homeCareRoutine: event.target.value,
                  }))
                }
                placeholder="Detersione, acidi, SPF, frequenza..."
              />
            </label>
            <label className={styles.profileField}>
              <LabelText className={styles.label} variant="field">
                Note estetista
              </LabelText>
              <Textarea
                className={`${styles.textarea} typo-body`}
                rows={4}
                value={draft.estheticianNotes}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    estheticianNotes: event.target.value,
                  }))
                }
                placeholder="Reazione al trattamento, tolleranza, follow-up consigliato..."
              />
            </label>
            <div className={styles.grid}>
              <label className={styles.profileField}>
                <LabelText className={styles.label} variant="field">
                  Servizi consigliati
                </LabelText>
                <Textarea
                  className={`${styles.textarea} typo-body`}
                  rows={3}
                  value={draft.serviceRecommendations}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      serviceRecommendations: event.target.value,
                    }))
                  }
                  placeholder="Protocolli consigliati, frequenza, cicli..."
                />
              </label>
              <label className={styles.profileField}>
                <LabelText className={styles.label} variant="field">
                  Prodotti consigliati
                </LabelText>
                <Textarea
                  className={`${styles.textarea} typo-body`}
                  rows={3}
                  value={draft.productRecommendations}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      productRecommendations: event.target.value,
                    }))
                  }
                  placeholder="SKU / linea / step routine"
                />
              </label>
            </div>
          </div>
        </div>

        <div className={styles.formActions}>
          <AccountPillButton
            type="submit"
            className={`${styles.pillButton} typo-small-upper`}
            disabled={saving}
          >
            {saving ? 'Salvataggio...' : 'Salva cartella estetica'}
          </AccountPillButton>
        </div>
        {message ? (
          <p className={`${message.type === 'success' ? styles.successText : styles.errorText} typo-caption`}>
            {message.text}
          </p>
        ) : null}
      </form>
    </>
  )
}
