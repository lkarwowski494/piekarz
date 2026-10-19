import { parseFeedingRatio, formatFeedingRatio, DEFAULT_FEEDING_RATIO } from '../feeding-ratio';

describe('proporcja dokarmiania [M1-audytor-generalny-023]', () => {
  it('zapis i odczyt są odwrotne', () => {
    expect(parseFeedingRatio(formatFeedingRatio([1, 5, 5]))).toEqual([1, 5, 5]);
    expect(formatFeedingRatio(DEFAULT_FEEDING_RATIO)).toBe('1:2:2');
  });

  it.each([undefined, null, '', '1:2', '1:2:2:2', 'a:b:c', '0:1:1', '-1:2:2', 12])('niepoprawny zapis %p → null', (v) => {
    expect(parseFeedingRatio(v)).toBeNull();
  });
});
