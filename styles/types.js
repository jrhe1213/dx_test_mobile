import styled, { css } from 'styled-components/native';

import {
  h1FontSize,
  h2FontSize,
  defaultFontSize,
  smallFontSize,
  xSmallFontSize,
} from './variables';

export const TextSize = styled.Text `

  ${({ h1 }) => h1 && css`
    font-size: ${ h1FontSize }
  `}
  ${({ h2 }) => h2 && css`
    font-size: ${ h2FontSize }
  `}
  ${({ base }) => base && css`
    font-size: ${ defaultFontSize }
  `}
  ${({ small }) => small && css`
    font-size: ${ smallFontSize }
  `}
  ${({ xSmall }) => xSmall && css`
    font-size: ${ xSmallFontSize }
  `}

`
