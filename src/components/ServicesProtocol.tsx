'use client'

import React, { useEffect, useLayoutEffect, useRef } from 'react'
import { motion, useAnimationControls } from 'framer-motion'

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
    <section className="services-protocol">
      <div className="services-protocol-intro">
        <span className="services-protocol-eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      <div ref={flowRef} className="services-protocol-flow">
        <motion.div
          ref={badgeRef}
          className="services-protocol-badge"
          animate={badgeControls}
          variants={{
            off: { borderColor: 'rgba(123, 180, 255, 0.35)', boxShadow: 'none' },
            on: {
              borderColor: 'rgba(123, 180, 255, 0.9)',
              boxShadow: '0 0 28px rgba(123, 180, 255, 0.4)',
            },
          }}
        >
          <motion.span
            className="services-protocol-badge-glow"
            animate={badgeGlowControls}
            variants={{
              off: { opacity: 0 },
              on: { opacity: 0.85 },
            }}
          />
          <span>DOB</span>
          <span>PROTOCOL</span>
        </motion.div>
        <span
          ref={leadLineRef}
          className="services-protocol-line services-protocol-line--lead"
          aria-hidden="true"
        />
        <span
          className="services-protocol-line services-protocol-line--seg services-protocol-line--seg1"
          aria-hidden="true"
        />
        <span
          className="services-protocol-line services-protocol-line--seg services-protocol-line--seg2"
          aria-hidden="true"
        />
        <span className="services-protocol-drop services-protocol-drop--badge" aria-hidden="true" />
        <div
          className="services-protocol-track"
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            zIndex: 50,
          }}
        >
          <motion.span
            className="services-protocol-runner"
            animate={runnerOneControls}
            style={{ position: 'absolute', left: 0, top: 0 }}
          />
          <motion.span
            className="services-protocol-runner"
            animate={runnerTwoControls}
            style={{ position: 'absolute', left: 0, top: 0 }}
          />
          <motion.span
            className="services-protocol-runner"
            animate={runnerThreeControls}
            style={{ position: 'absolute', left: 0, top: 0 }}
          />
        </div>
        <div className="services-protocol-steps">
          <div className="services-protocol-step services-protocol-step--one">
            <div className="services-protocol-step-top">
              <span
                className="services-protocol-drop services-protocol-drop--step"
                aria-hidden="true"
              />
              <motion.span
                className="services-protocol-node"
                animate={nodeOneControls}
                variants={{
                  off: { borderColor: 'rgba(123, 180, 255, 0.35)', boxShadow: 'none' },
                  on: {
                    borderColor: 'rgba(123, 180, 255, 0.9)',
                    boxShadow: '0 0 16px rgba(123, 180, 255, 0.45)',
                  },
                }}
              >
                01
              </motion.span>
            </div>
            <motion.div
              ref={cardOneRef}
              className="services-protocol-card"
              animate={stepOneControls}
              variants={{
                off: {
                  borderColor: 'rgba(123, 180, 255, 0.2)',
                  boxShadow: '0 18px 40px rgba(0, 0, 0, 0.45)',
                },
                on: {
                  borderColor: 'rgba(123, 180, 255, 0.85)',
                  boxShadow: '0 22px 46px rgba(0, 0, 0, 0.5), 0 0 18px rgba(123, 180, 255, 0.35)',
                },
              }}
            >
              <span className="services-protocol-icon" aria-hidden="true" />
              <h3>Analisi / consulenza</h3>
              <p>
                Diagnosi personalizzata, ascolto e definizione degli obiettivi per costruire il
                percorso più efficace.
              </p>
            </motion.div>
          </div>
          <div className="services-protocol-step services-protocol-step--two">
            <div className="services-protocol-step-top">
              <span
                className="services-protocol-drop services-protocol-drop--step"
                aria-hidden="true"
              />
              <motion.span
                className="services-protocol-node"
                animate={nodeTwoControls}
                variants={{
                  off: { borderColor: 'rgba(123, 180, 255, 0.35)', boxShadow: 'none' },
                  on: {
                    borderColor: 'rgba(123, 180, 255, 0.9)',
                    boxShadow: '0 0 16px rgba(123, 180, 255, 0.45)',
                  },
                }}
              >
                02
              </motion.span>
            </div>
            <motion.div
              ref={cardTwoRef}
              className="services-protocol-card"
              animate={stepTwoControls}
              variants={{
                off: {
                  borderColor: 'rgba(123, 180, 255, 0.2)',
                  boxShadow: '0 18px 40px rgba(0, 0, 0, 0.45)',
                },
                on: {
                  borderColor: 'rgba(123, 180, 255, 0.85)',
                  boxShadow: '0 22px 46px rgba(0, 0, 0, 0.5), 0 0 18px rgba(123, 180, 255, 0.35)',
                },
              }}
            >
              <span className="services-protocol-icon" aria-hidden="true" />
              <h3>Trattamento + tecnologia</h3>
              <p>
                Manualità esperte e protocolli avanzati per massimizzare i risultati in tempi
                misurabili.
              </p>
            </motion.div>
          </div>
          <div className="services-protocol-step services-protocol-step--three">
            <div className="services-protocol-step-top">
              <span
                className="services-protocol-drop services-protocol-drop--step"
                aria-hidden="true"
              />
              <motion.span
                className="services-protocol-node"
                animate={nodeThreeControls}
                variants={{
                  off: { borderColor: 'rgba(123, 180, 255, 0.35)', boxShadow: 'none' },
                  on: {
                    borderColor: 'rgba(123, 180, 255, 0.9)',
                    boxShadow: '0 0 16px rgba(123, 180, 255, 0.45)',
                  },
                }}
              >
                03
              </motion.span>
            </div>
            <motion.div
              ref={cardThreeRef}
              className="services-protocol-card"
              animate={stepThreeControls}
              variants={{
                off: {
                  borderColor: 'rgba(123, 180, 255, 0.2)',
                  boxShadow: '0 18px 40px rgba(0, 0, 0, 0.45)',
                },
                on: {
                  borderColor: 'rgba(123, 180, 255, 0.85)',
                  boxShadow: '0 22px 46px rgba(0, 0, 0, 0.5), 0 0 18px rgba(123, 180, 255, 0.35)',
                },
              }}
            >
              <span className="services-protocol-icon" aria-hidden="true" />
              <h3>Follow-up + mantenimento</h3>
              <p>
                Piano di mantenimento e monitoraggio continuo per risultati duraturi e progressivi.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
