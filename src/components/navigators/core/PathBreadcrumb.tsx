'use client'

import { motion } from 'framer-motion'
import type { ComponentType, ReactNode } from 'react'

type BreadcrumbNode<Step extends string> = {
  id: string
  label: string
  step: Step
}

type PathBreadcrumbClassNames = {
  root: string
  row: string
  backButton: string
  backIcon: string
  backLabel: string
  connector: string
  nodeWrap: string
  nodeButton: string
  nodeDot: string
  nodeLabel: string
  guide: string
  empty: string
  emptyText?: string
  fullWidth?: string
}

type PathBreadcrumbProps<Step extends string> = {
  nodes: Array<BreadcrumbNode<Step>>
  guideMessage: string
  onNavigateToStep: (step: Step) => void
  onBack: () => void
  classNames: PathBreadcrumbClassNames
  BackIcon: ComponentType<{ className?: string }>
  renderContainer?: (children: ReactNode) => ReactNode
}

export function PathBreadcrumbCore<Step extends string>({
  nodes,
  guideMessage,
  onNavigateToStep,
  onBack,
  classNames,
  BackIcon,
  renderContainer,
}: PathBreadcrumbProps<Step>) {
  const hasGuide = guideMessage.trim().length > 0

  const content =
    nodes.length > 0 ? (
      <div className={classNames.fullWidth}>
        <div className={classNames.row}>
          <button onClick={onBack} className={classNames.backButton}>
            <BackIcon className={classNames.backIcon} />
            <span className={classNames.backLabel}>Indietro</span>
          </button>

          <div className={classNames.connector} />

          {nodes.map((node, index) => (
            <div key={node.id} className={classNames.nodeWrap}>
              <button onClick={() => onNavigateToStep(node.step)} className={classNames.nodeButton}>
                <div className={classNames.nodeDot} />
                <span className={classNames.nodeLabel}>{node.label}</span>
              </button>

              {index < nodes.length - 1 && <div className={classNames.connector} />}
            </div>
          ))}

          {hasGuide && (
            <>
              <div className={classNames.connector} />
              <span className={classNames.guide}>{guideMessage}</span>
            </>
          )}
        </div>
      </div>
    ) : (
      <div className={classNames.empty}>
        <p className={classNames.emptyText || classNames.guide}>{guideMessage}</p>
      </div>
    )

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={classNames.root}>
      {renderContainer ? renderContainer(content) : content}
    </motion.div>
  )
}
