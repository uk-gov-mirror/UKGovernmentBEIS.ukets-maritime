import { Service } from '@angular/core';

import { Match, Operation, OperationMap } from '@shared/directives/html-diff/html-diff.type';
import { isNullOrEmpty } from '@shared/utils';

@Service()
export class HtmlDiffService {
  private isEndOfTag(char: string): boolean {
    return char === '>';
  }

  private isStartOfTag(char: string): boolean {
    return char === '<';
  }

  private isWhitespace(char: string): boolean {
    return /^\s+$/.test(char);
  }

  private isTag(token: string): boolean {
    return /^\s*<[^>]+>\s*$/.test(token);
  }

  private isNotTag(token: string): boolean {
    return !this.isTag(token);
  }

  private htmlToTokens(html: string): string[] {
    let mode: 'tag' | 'char' | 'whitespace' = 'char';
    let currentWord = '';
    const words: string[] = [];

    for (let i = 0, len = html?.length; i < len; i++) {
      const char = html[i];

      switch (mode) {
        case 'tag':
          if (this.isEndOfTag(char)) {
            currentWord += '>';
            words.push(currentWord);
            currentWord = '';

            if (this.isWhitespace(char)) {
              mode = 'whitespace';
            } else {
              mode = 'char';
            }
          } else {
            currentWord += char;
          }
          break;
        case 'char':
          if (this.isStartOfTag(char)) {
            if (currentWord) {
              words.push(currentWord);
            }
            currentWord = '<';
            mode = 'tag';
          } else if (/\s/.test(char)) {
            if (currentWord) {
              words.push(currentWord);
            }
            currentWord = char;
            mode = 'whitespace';
          } else if (/[\w#@]+/i.test(char)) {
            currentWord += char;
          } else {
            if (currentWord) {
              words.push(currentWord);
            }
            currentWord = char;
          }
          break;
        case 'whitespace':
          if (this.isStartOfTag(char)) {
            if (currentWord) {
              words.push(currentWord);
            }
            currentWord = '<';
            mode = 'tag';
          } else if (this.isWhitespace(char)) {
            currentWord += char;
          } else {
            if (currentWord) {
              words.push(currentWord);
            }
            currentWord = char;
            mode = 'char';
          }
          break;
        default:
          throw new Error(`Unknown mode ${mode}`);
      }
    }

    if (currentWord) {
      words.push(currentWord);
    }

    return words;
  }

  private findMatch(
    beforeTokens: string[],
    indexOfBeforeLocationsInAfterTokens: { [key: string]: number[] },
    startInBefore: number,
    endInBefore: number,
    startInAfter: number,
    endInAfter: number,
  ): Match | undefined {
    let bestMatchInBefore = startInBefore;
    let bestMatchInAfter = startInAfter;
    let bestMatchLength = 0;
    let matchLengthAt: { [key: number]: number } = {};

    for (let indexInBefore = startInBefore; indexInBefore < endInBefore; indexInBefore++) {
      const newMatchLengthAt: { [key: number]: number } = {};
      const lookingFor = beforeTokens[indexInBefore];
      const locationsInAfter = indexOfBeforeLocationsInAfterTokens[lookingFor];

      for (const indexInAfter of locationsInAfter) {
        if (indexInAfter < startInAfter) {
          continue;
        }
        if (indexInAfter >= endInAfter) {
          break;
        }
        if (matchLengthAt[indexInAfter - 1] == null) {
          matchLengthAt[indexInAfter - 1] = 0;
        }
        const newMatchLength = matchLengthAt[indexInAfter - 1] + 1;
        newMatchLengthAt[indexInAfter] = newMatchLength;

        if (newMatchLength > bestMatchLength) {
          bestMatchInBefore = indexInBefore - newMatchLength + 1;
          bestMatchInAfter = indexInAfter - newMatchLength + 1;
          bestMatchLength = newMatchLength;
        }
      }

      matchLengthAt = newMatchLengthAt;
    }

    if (bestMatchLength !== 0) {
      return new Match(bestMatchInBefore, bestMatchInAfter, bestMatchLength);
    }

    return undefined;
  }

  private recursivelyFindMatchingBlocks(
    beforeTokens: string[],
    afterTokens: string[],
    indexOfBeforeLocationsInAfterTokens: { [key: string]: number[] },
    startInBefore: number,
    endInBefore: number,
    startInAfter: number,
    endInAfter: number,
    matchingBlocks: Match[],
  ): Match[] {
    const match = this.findMatch(
      beforeTokens,
      indexOfBeforeLocationsInAfterTokens,
      startInBefore,
      endInBefore,
      startInAfter,
      endInAfter,
    );

    if (match) {
      if (startInBefore < match.startInBefore && startInAfter < match.startInAfter) {
        this.recursivelyFindMatchingBlocks(
          beforeTokens,
          afterTokens,
          indexOfBeforeLocationsInAfterTokens,
          startInBefore,
          match.startInBefore,
          startInAfter,
          match.startInAfter,
          matchingBlocks,
        );
      }

      matchingBlocks.push(match);

      if (match.endInBefore <= endInBefore && match.endInAfter <= endInAfter) {
        this.recursivelyFindMatchingBlocks(
          beforeTokens,
          afterTokens,
          indexOfBeforeLocationsInAfterTokens,
          match.endInBefore + 1,
          endInBefore,
          match.endInAfter + 1,
          endInAfter,
          matchingBlocks,
        );
      }
    }

    return matchingBlocks;
  }

  private createIndex(p: { findThese: string[]; inThese: string[] }): { [key: string]: number[] } {
    if (!p.findThese) {
      throw new Error('params must have findThese key');
    }
    if (!p.inThese) {
      throw new Error('params must have inThese key');
    }

    const index: { [key: string]: number[] } = {};

    for (const token of p.findThese) {
      index[token] = [];
      let idx = p.inThese.indexOf(token);

      while (idx !== -1) {
        index[token].push(idx);
        idx = p.inThese.indexOf(token, idx + 1);
      }
    }

    return index;
  }

  private findMatchingBlocks(beforeTokens: string[], afterTokens: string[]): Match[] {
    const matchingBlocks: Match[] = [];
    const indexOfBeforeLocationsInAfterTokens = this.createIndex({
      findThese: beforeTokens,
      inThese: afterTokens,
    });

    return this.recursivelyFindMatchingBlocks(
      beforeTokens,
      afterTokens,
      indexOfBeforeLocationsInAfterTokens,
      0,
      beforeTokens.length,
      0,
      afterTokens.length,
      matchingBlocks,
    );
  }

  private calculateOperations(beforeTokens: string[], afterTokens: string[]): Operation[] {
    let positionInBefore = 0;
    let positionInAfter = 0;
    const operations: Operation[] = [];
    const actionMap = {
      'false,false': 'replace',
      'true,false': 'insert',
      'false,true': 'delete',
      'true,true': 'none',
    };

    const matches = this.findMatchingBlocks(beforeTokens, afterTokens);
    matches.push(new Match(beforeTokens.length, afterTokens.length, 0));

    for (let index = 0; index < matches.length; index++) {
      const match = matches[index];
      const matchStartsAtCurrentPositionInBefore = positionInBefore === match.startInBefore;
      const matchStartsAtCurrentPositionInAfter = positionInAfter === match.startInAfter;
      const actionUpToMatchPositions =
        actionMap[[matchStartsAtCurrentPositionInBefore, matchStartsAtCurrentPositionInAfter].toString()];

      if (actionUpToMatchPositions !== 'none') {
        operations.push({
          action: actionUpToMatchPositions,
          startInBefore: positionInBefore,
          endInBefore: actionUpToMatchPositions !== 'insert' ? match.startInBefore - 1 : undefined,
          startInAfter: positionInAfter,
          endInAfter: actionUpToMatchPositions !== 'delete' ? match.startInAfter - 1 : undefined,
        });
      }

      if (match.length !== 0) {
        operations.push({
          action: 'equal',
          startInBefore: match.startInBefore,
          endInBefore: match.endInBefore,
          startInAfter: match.startInAfter,
          endInAfter: match.endInAfter,
        });
      }

      positionInBefore = match.endInBefore + 1;
      positionInAfter = match.endInAfter + 1;
    }

    const postProcessed: any[] = [];
    let lastOp = { action: 'none' };

    function isSingleWhitespace(op: Operation): boolean {
      if (op.action !== 'equal') {
        return false;
      }
      if (op.endInBefore - op.startInBefore !== 0) {
        return false;
      }
      return /^\s$/.test(beforeTokens.slice(op.startInBefore, op.endInBefore + 1).join(''));
    }

    for (let i = 0; i < operations.length; i++) {
      const op = operations[i];

      if (
        (isSingleWhitespace(op) && lastOp.action === 'replace') ||
        (op.action === 'replace' && lastOp.action === 'replace')
      ) {
        lastOp['endInBefore'] = op.endInBefore;
        lastOp['endInAfter'] = op.endInAfter;
      } else {
        postProcessed.push(op);
        lastOp = op;
      }
    }

    return postProcessed;
  }

  private consecutiveWhere(start: number, content: string[], expectedIsTag: boolean) {
    let answer: boolean;
    let lastMatchingIndex: number | null;
    let token: string;
    content = content.slice(start, +content.length + 1 || 9e9);
    lastMatchingIndex = void 0;
    for (let index = 0, i = 0, len = content.length; i < len; index = ++i) {
      token = content[index];
      answer = expectedIsTag ? this.isTag(token) : this.isNotTag(token);
      if (answer === true) {
        lastMatchingIndex = index;
      }
      if (answer === false) {
        break;
      }
    }
    if (lastMatchingIndex != null) {
      return content.slice(0, +lastMatchingIndex + 1 || 9e9);
    }
    return [];
  }

  private wrap(tag: string, content: string[], className: string = ''): string {
    let rendering = '';
    let position = 0;
    const length = content.length;

    while (true) {
      if (position >= length) {
        break;
      }

      const nonTags = this.consecutiveWhere(position, content, false);
      position += nonTags.length;

      if (nonTags.length !== 0) {
        const tagWithClass = className.length > 0 ? `${tag} class="${className}"` : `${tag}`;
        rendering += `<${tagWithClass}>${nonTags.join('')}</${tag}>`;
      }

      if (position >= length) {
        break;
      }

      const tags = this.consecutiveWhere(position, content, true);
      position += tags.length;
      rendering += tags.join('');
    }

    return rendering;
  }

  private renderOperations(beforeTokens: string[], afterTokens: string[], operations: Operation[]): string {
    const opMap: OperationMap = {
      equal: (op, beforeTokens) => beforeTokens.slice(op.startInBefore, +op.endInBefore + 1 || 9e9).join(''),
      insert: (op, beforeTokens, afterTokens) => {
        const val = afterTokens.slice(op.startInAfter, +op.endInAfter + 1 || 9e9);
        return this.wrap('ins', val, 'diffmod');
      },
      delete: (op, beforeTokens) => {
        const val = beforeTokens.slice(op.startInBefore, +op.endInBefore + 1 || 9e9);
        return this.wrap('del', val, 'diffmod');
      },
    };
    opMap.replace = (op, beforeTokens, afterTokens) =>
      opMap.delete(op, beforeTokens, afterTokens) + opMap.insert(op, beforeTokens, afterTokens);

    let rendering = '';

    for (let i = 0; i < operations.length; i++) {
      const op = operations[i];
      rendering += opMap[op.action](op, beforeTokens, afterTokens);
    }

    return rendering;
  }

  diff(before: string, after: string): string {
    if (before === after) {
      return before;
    }

    const beforeTokens = this.htmlToTokens(before);
    const afterTokens = this.htmlToTokens(after);
    const ops = this.calculateOperations(beforeTokens, afterTokens);

    return this.renderOperations(beforeTokens, afterTokens, ops);
  }

  singleTokenDiff(before: string, after: string): string {
    if (before === after) {
      return before;
    }

    if (isNullOrEmpty(before)) {
      return `<ins class="diffmod">${after}</ins>`;
    }

    if (isNullOrEmpty(after)) {
      return `<del class="diffmod">${before}</del>`;
    }

    return `<del class="diffmod">${before}</del><ins class="diffmod">${after}</ins>`;
  }
}
