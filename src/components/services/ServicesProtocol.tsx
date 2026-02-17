'use client'

import React, { useEffect, useLayoutEffect, useRef } from 'react'
import { motion, useAnimationControls } from 'framer-motion'
import { cn } from '@/lib/cn'
import styles from './ServicesProtocol.module.css'

type ServicesProtocolProps = {
  eyebrow?: string
  title?: string
}

export const ServicesProtocol = ({
  eyebrow = 'DOB Protocol',
  title = 'Metodo in tre step, risultati reali.',
}: ServicesProtocolProps) => {
  const badgeControls = useAnimationControls()
  const badgeGlowControls = useAnimationControls()
  const runnerOneControls = useAnimationControls()
  const runnerTwoControls = useAnimationControls()
  const runnerThreeControls = useAnimationControls()
  const stepOneControls = useAnimationControls()
  const stepTwoControls = useAnimationControls()
  const stepThreeControls = useAnimationControls()
  const nodeOneControls = useAnimationControls()
  const nodeTwoControls = useAnimationControls()
  const nodeThreeControls = useAnimationControls()
  const flowRef = useRef<HTMLDivElement | null>(null)
  const badgeRef = useRef<HTMLDivElement | null>(null)
  const leadLineRef = useRef<HTMLSpanElement | null>(null)
  const cardOneRef = useRef<HTMLDivElement | null>(null)
  const cardTwoRef = useRef<HTMLDivElement | null>(null)
  const cardThreeRef = useRef<HTMLDivElement | null>(null)

  type RunnerGeo = {
    lineY: number
    badgeX: number
    badgeY: number
    c1: { x: number; y: number }
    c2: { x: number; y: number }
    c3: { x: number; y: number }
  }
  const runnerGeoRef = useRef<RunnerGeo | null>(null)

  useLayoutEffect(() => {
    const compute = () => {
      const flowEl = flowRef.current
      const badgeEl = badgeRef.current
      if (!flowEl || !badgeEl) return
      const rect = flowEl.getBoundingClientRect()
      const lineEl = leadLineRef.current
      const lineRect = lineEl?.getBoundingClientRect()
      const lineY = lineRect ? lineRect.top + lineRect.height / 2 - rect.top : 0
      const badgeRect = badgeEl.getBoundingClientRect()
      const badgeX = badgeRect.left + badgeRect.width / 2 - rect.left
      const badgeY = badgeRect.top - rect.top
      flowEl.style.setProperty('--protocol-line-start', `${badgeX}px`)
      flowEl.style.setProperty('--protocol-steps-width', `${rect.width - badgeX}px`)
      const cardPoint = (el: HTMLElement) => {
        const r = el.getBoundingClientRect()
        return { x: r.left + r.width / 2 - rect.left, y: r.top - rect.top }
      }
      const c1 = cardOneRef.current ? cardPoint(cardOneRef.current) : { x: 0, y: 0 }
      const c2 = cardTwoRef.current ? cardPoint(cardTwoRef.current) : { x: 0, y: 0 }
      const c3 = cardThreeRef.current ? cardPoint(cardThreeRef.current) : { x: 0, y: 0 }
      runnerGeoRef.current = { lineY, badgeX, badgeY, c1, c2, c3 }
    }

    compute()
    window.addEventListener('resize', compute)
    return () => window.removeEventListener('resize', compute)
  }, [])

  useEffect(() => {
    let active = true

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

    const run = async () => {
      while (active) {
        await Promise.all([
          badgeControls.start('off', { duration: 0.25 }),
          badgeGlowControls.start('off', { duration: 0.25 }),
          stepOneControls.start('off', { duration: 0.25 }),
          stepTwoControls.start('off', { duration: 0.25 }),
          stepThreeControls.start('off', { duration: 0.25 }),
          nodeOneControls.start('off', { duration: 0.25 }),
          nodeTwoControls.start('off', { duration: 0.25 }),
          nodeThreeControls.start('off', { duration: 0.25 }),
        ])

        await sleep(1775)

        await Promise.all([
          badgeControls.start('on', { duration: 0.35 }),
          badgeGlowControls.start('on', { duration: 0.45 }),
        ])

        const geo = runnerGeoRef.current
        if (!geo) {
          await sleep(120)
          continue
        }

        await sleep(500)

        // Runner 1 -> Box 1
        const offset = 6

        await runnerOneControls.start({
          x: [geo.badgeX - offset, geo.badgeX - offset, geo.c1.x - offset, geo.c1.x - offset],
          y: [geo.badgeY - offset, geo.lineY - offset, geo.lineY - offset, geo.c1.y - offset],
          opacity: [0, 1, 1, 0],
          transition: { duration: 2.54, times: [0, 0.15, 0.85, 1], ease: 'easeInOut' },
        })
        await Promise.all([
          stepOneControls.start('on', { duration: 0.35 }),
          nodeOneControls.start('on', { duration: 0.35 }),
        ])

        // Runner 2 -> Box 2
        await sleep(500)
        await runnerTwoControls.start({
          x: [geo.c1.x - offset, geo.c1.x - offset, geo.c2.x - offset, geo.c2.x - offset],
          y: [geo.lineY - offset, geo.lineY - offset, geo.lineY - offset, geo.c2.y - offset],
          opacity: [0, 1, 1, 0],
          transition: { duration: 2.79, times: [0, 0.25, 0.7, 1], ease: 'easeInOut' },
        })
        await Promise.all([
          stepTwoControls.start('on', { duration: 0.35 }),
          nodeTwoControls.start('on', { duration: 0.35 }),
        ])

        // Runner 3 -> Box 3
        await sleep(500)
        await runnerThreeControls.start({
          x: [geo.c2.x - offset, geo.c2.x - offset, geo.c3.x - offset, geo.c3.x - offset],
          y: [geo.lineY - offset, geo.lineY - offset, geo.lineY - offset, geo.c3.y - offset],
          opacity: [0, 1, 1, 0],
          transition: { duration: 2.79, times: [0, 0.25, 0.7, 1], ease: 'easeInOut' },
        })
        await Promise.all([
          stepThreeControls.start('on', { duration: 0.35 }),
          nodeThreeControls.start('on', { duration: 0.35 }),
        ])

        await sleep(2282)

        await sleep(2000)

        await Promise.all([
          badgeControls.start('off', { duration: 0.3 }),
          badgeGlowControls.start('off', { duration: 0.3 }),
          stepOneControls.start('off', { duration: 0.3 }),
          stepTwoControls.start('off', { duration: 0.3 }),
          stepThreeControls.start('off', { duration: 0.3 }),
          nodeOneControls.start('off', { duration: 0.3 }),
          nodeTwoControls.start('off', { duration: 0.3 }),
          nodeThreeControls.start('off', { duration: 0.3 }),
        ])

        await sleep(2282)
      }
    }

    run()
    return () => {
      active = false
    }
  }, [
    badgeControls,
    badgeGlowControls,
    runnerOneControls,
    runnerTwoControls,
    runnerThreeControls,
    stepOneControls,
    stepTwoControls,
    stepThreeControls,
    nodeOneControls,
    nodeTwoControls,
    nodeThreeControls,
  ])

  return (
    <section className={styles.protocol}>
      <div className={styles.intro}>
        <span className={`${styles.eyebrow} typo-caption-upper`}>{eyebrow}</span>
        <h2 className={`${styles.title} typo-display-upper`}>{title}</h2>
      </div>
      <div ref={flowRef} className={styles.flow}>
        <motion.div
          ref={badgeRef}
          className={`${styles.badge} typo-caption-upper`}
          animate={badgeControls}
          variants={{
            off: { borderColor: 'var(--protocol-accent)', boxShadow: 'none' },
            on: {
              borderColor: 'var(--protocol-accent-strong)',
              boxShadow: '0 0 28px var(--protocol-accent-glow)',
            },
          }}
        >
          <motion.span
            className={styles.badgeGlow}
            animate={badgeGlowControls}
            variants={{
              off: { opacity: 0 },
              on: { opacity: 0.85 },
            }}
          />
          <span>DOB</span>
          <span>PROTOCOL</span>
        </motion.div>
        <span ref={leadLineRef} className={cn(styles.line, styles.lineLead)} aria-hidden="true" />
        <span className={cn(styles.line, styles.lineSeg1)} aria-hidden="true" />
        <span className={cn(styles.line, styles.lineSeg2)} aria-hidden="true" />
        <span className={cn(styles.drop, styles.dropBadge)} aria-hidden="true" />
        <div className={styles.track} aria-hidden="true">
          <motion.span className={styles.runner} animate={runnerOneControls} />
          <motion.span className={styles.runner} animate={runnerTwoControls} />
          <motion.span className={styles.runner} animate={runnerThreeControls} />
        </div>
        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepTop}>
              <span className={cn(styles.drop, styles.dropStep)} aria-hidden="true" />
              <motion.span
              className={`${styles.node} typo-caption-upper`}
                animate={nodeOneControls}
                variants={{
                  off: { borderColor: 'var(--protocol-accent)', boxShadow: 'none' },
                  on: {
                    borderColor: 'var(--protocol-accent-strong)',
                    boxShadow: '0 0 28px var(--protocol-accent-glow)',
                  },
                }}
              >
                01
              </motion.span>
            </div>
            <motion.div
              ref={cardOneRef}
              className={styles.card}
              animate={stepOneControls}
                variants={{
                  off: {
                    borderColor: 'var(--protocol-accent)',
                    boxShadow: 'var(--shadow-soft)',
                  },
                  on: {
                    borderColor: 'var(--protocol-accent-strong)',
                    boxShadow: '0 0 38px var(--protocol-accent-glow)',
                },
              }}
            >
              <span className={styles.icon} aria-hidden="true" />
              <h3 className={`${styles.cardTitle} typo-body-lg-upper`}>Analisi / consulenza</h3>
              <p className={`${styles.cardBody} typo-body`}>
                Diagnosi personalizzata, ascolto e definizione degli obiettivi per costruire il
                percorso più efficace.
              </p>
            </motion.div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepTop}>
              <span className={cn(styles.drop, styles.dropStep)} aria-hidden="true" />
              <motion.span
              className={`${styles.node} typo-caption-upper`}
                animate={nodeTwoControls}
                variants={{
                  off: { borderColor: 'var(--protocol-accent)', boxShadow: 'none' },
                  on: {
                    borderColor: 'var(--protocol-accent-strong)',
                    boxShadow: '0 0 28px var(--protocol-accent-glow)',
                  },
                }}
              >
                02
              </motion.span>
            </div>
            <motion.div
              ref={cardTwoRef}
              className={styles.card}
              animate={stepTwoControls}
                variants={{
                  off: {
                    borderColor: 'var(--protocol-accent)',
                    boxShadow: 'var(--shadow-soft)',
                  },
                  on: {
                    borderColor: 'var(--protocol-accent-strong)',
                    boxShadow: '0 0 38px var(--protocol-accent-glow)',
                },
              }}
            >
              <span className={styles.icon} aria-hidden="true" />
              <h3 className={`${styles.cardTitle} typo-body-lg-upper`}>Trattamento + tecnologia</h3>
              <p className={`${styles.cardBody} typo-body`}>
                Manualità esperte e protocolli avanzati per massimizzare i risultati in tempi
                misurabili.
              </p>
            </motion.div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepTop}>
              <span className={cn(styles.drop, styles.dropStep)} aria-hidden="true" />
              <motion.span
              className={`${styles.node} typo-caption-upper`}
                animate={nodeThreeControls}
                variants={{
                  off: { borderColor: 'var(--protocol-accent)', boxShadow: 'none' },
                  on: {
                    borderColor: 'var(--protocol-accent-strong)',
                    boxShadow: '0 0 28px var(--protocol-accent-glow)',
                  },
                }}
              >
                03
              </motion.span>
            </div>
            <motion.div
              ref={cardThreeRef}
              className={styles.card}
              animate={stepThreeControls}
                variants={{
                  off: {
                    borderColor: 'var(--protocol-accent)',
                    boxShadow: 'var(--shadow-soft)',
                  },
                  on: {
                    borderColor: 'var(--protocol-accent-strong)',
                    boxShadow: '0 0 38px var(--protocol-accent-glow)',
                },
              }}
            >
              <span className={styles.icon} aria-hidden="true" />
              <h3 className={`${styles.cardTitle} typo-body-lg-upper`}>Follow-up + mantenimento</h3>
              <p className={`${styles.cardBody} typo-body`}>
                Piano di mantenimento e monitoraggio continuo per risultati duraturi e progressivi.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
