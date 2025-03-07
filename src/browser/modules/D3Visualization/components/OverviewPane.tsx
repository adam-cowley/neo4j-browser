/*
 * Copyright (c) "Neo4j"
 * Neo4j Sweden AB [http://neo4j.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import React, { useState } from 'react'
import { Icon } from 'semantic-ui-react'

import { GraphStats } from '../mapper'
import { StyleableNodeLabel } from './StyleableNodeLabel'
import { StyleableRelType } from './StyleableRelType'
import {
  PaneBody,
  PaneBodySectionHeaderWrapper,
  PaneBodySectionSmallText,
  PaneBodySectionTitle,
  PaneHeader,
  StyledLegendInlineList
} from './styled'
import { ShowMoreOrAll } from 'browser-components/ShowMoreOrAll/ShowMoreOrAll'
import { StyledTruncatedMessage } from 'browser/modules/Stream/styled'
import { GraphStyle } from 'project-root/src/browser/modules/D3Visualization/graphStyle'
import numberToUSLocale from 'shared/utils/number-to-US-locale'

type PaneBodySectionHeaderProps = {
  title: string
  numOfElementsVisible: number
  totalNumOfElements: number
}
function PaneBodySectionHeader({
  title,
  numOfElementsVisible,
  totalNumOfElements
}: PaneBodySectionHeaderProps) {
  return (
    <PaneBodySectionHeaderWrapper>
      <PaneBodySectionTitle>{title}</PaneBodySectionTitle>
      {numOfElementsVisible < totalNumOfElements && (
        <PaneBodySectionSmallText>
          {`(showing ${numOfElementsVisible} of ${totalNumOfElements})`}
        </PaneBodySectionSmallText>
      )}
    </PaneBodySectionHeaderWrapper>
  )
}

type OverviewPaneProps = {
  graphStyle: GraphStyle
  hasTruncatedFields: boolean
  nodeCount: number | null
  relationshipCount: number | null
  stats: GraphStats
  infoMessage: string | null
}

export const OVERVIEW_STEP_SIZE = 50

function OverviewPane({
  graphStyle,
  hasTruncatedFields,
  nodeCount,
  relationshipCount,
  stats,
  infoMessage
}: OverviewPaneProps): JSX.Element {
  const [maxLabelsCount, setMaxLabelsCount] = useState(OVERVIEW_STEP_SIZE)
  const [maxRelationshipsCount, setMaxRelationshipsCount] =
    useState(OVERVIEW_STEP_SIZE)

  const onMoreLabelsClick = (numMore: number) => {
    setMaxLabelsCount(maxLabelsCount + numMore)
  }

  const onMoreRelationshipsClick = (numMore: number) => {
    setMaxRelationshipsCount(maxRelationshipsCount + numMore)
  }

  const { relTypes, labels } = stats
  const visibleLabelKeys = labels
    ? Object.keys(labels).slice(0, maxLabelsCount)
    : []
  const visibleRelationshipKeys = relTypes
    ? Object.keys(relTypes).slice(0, maxRelationshipsCount)
    : []
  const totalNumOfLabelTypes = labels ? Object.keys(labels).length : 0
  const totalNumOfRelTypes = relTypes ? Object.keys(relTypes).length : 0

  return (
    <>
      <PaneHeader>{'Overview'}</PaneHeader>
      <PaneBody>
        {labels && visibleLabelKeys.length !== 0 && (
          <div>
            <PaneBodySectionHeader
              title={'Node labels'}
              numOfElementsVisible={visibleLabelKeys.length}
              totalNumOfElements={totalNumOfLabelTypes}
            />
            <StyledLegendInlineList>
              {visibleLabelKeys.map((label: string) => (
                <StyleableNodeLabel
                  key={label}
                  graphStyle={graphStyle}
                  selectedLabel={{
                    label,
                    propertyKeys: Object.keys(labels[label].properties),
                    count: labels[label].count
                  }}
                />
              ))}
            </StyledLegendInlineList>
            <ShowMoreOrAll
              total={totalNumOfLabelTypes}
              shown={visibleLabelKeys.length}
              moreStep={OVERVIEW_STEP_SIZE}
              onMore={onMoreLabelsClick}
            />
          </div>
        )}
        {relTypes && visibleRelationshipKeys.length !== 0 && (
          <div>
            <PaneBodySectionHeader
              title={'Relationship Types'}
              numOfElementsVisible={visibleRelationshipKeys.length}
              totalNumOfElements={totalNumOfRelTypes}
            />
            <StyledLegendInlineList>
              {visibleRelationshipKeys.map(relType => (
                <StyleableRelType
                  key={relType}
                  graphStyle={graphStyle}
                  selectedRelType={{
                    relType,
                    propertyKeys: Object.keys(relTypes[relType].properties),
                    count: relTypes[relType].count
                  }}
                />
              ))}
            </StyledLegendInlineList>
            <ShowMoreOrAll
              total={totalNumOfRelTypes}
              shown={visibleRelationshipKeys.length}
              moreStep={OVERVIEW_STEP_SIZE}
              onMore={onMoreRelationshipsClick}
            />
          </div>
        )}
        <div style={{ paddingBottom: '10px' }}>
          {hasTruncatedFields && (
            <StyledTruncatedMessage>
              <Icon name="warning sign" /> Record fields have been
              truncated.&nbsp;
            </StyledTruncatedMessage>
          )}
          {infoMessage && (
            <StyledTruncatedMessage>
              <Icon name="warning sign" />
              {infoMessage}&nbsp;
            </StyledTruncatedMessage>
          )}
          {nodeCount !== null &&
            relationshipCount !== null &&
            `Displaying ${numberToUSLocale(
              nodeCount
            )} nodes, ${numberToUSLocale(relationshipCount)} relationships.`}
        </div>
      </PaneBody>
    </>
  )
}

export default OverviewPane
