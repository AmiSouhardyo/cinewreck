// services/PosterService.ts
export interface PosterProvider {
  getPoster(title: string, year?: string | number): Promise<string | null>;
}

export class WikimediaPosterService implements PosterProvider {
  private async fetchWikipediaImage(title: string): Promise<string | null> {
    try {
      // 1. Try Wikipedia REST v1 Summary API
      const restUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`;
      const restRes = await fetch(restUrl, {
        headers: {
          'User-Agent': 'CineMatchAI/1.0 (https://ais.studio; contact@cinematch.app)',
          'Accept': 'application/json'
        }
      });

      if (restRes.ok) {
        const contentType = restRes.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const restData = await restRes.json();
          if (restData?.thumbnail?.source) {
            return restData.thumbnail.source;
          }
        }
      }

      // 2. Fallback to Action API query with required User-Agent
      const actionUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&titles=${encodeURIComponent(title)}&format=json&pithumbsize=500&origin=*`;
      const actionRes = await fetch(actionUrl, {
        headers: {
          'Api-User-Agent': 'CineMatchAI/1.0 (https://ais.studio; contact@cinematch.app)',
          'User-Agent': 'CineMatchAI/1.0 (https://ais.studio; contact@cinematch.app)',
          'Accept': 'application/json'
        }
      });

      if (!actionRes.ok) return null;

      const contentType = actionRes.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return null;

      const data = await actionRes.json();
      const pages = data?.query?.pages;
      if (!pages) return null;

      const pageId = Object.keys(pages)[0];
      if (pageId === "-1" || !pages[pageId]?.thumbnail) return null;

      return pages[pageId].thumbnail.source;
    } catch (error) {
      // Quietly handle fetch errors without crashing or throwing JSON syntax errors
      return null;
    }
  }

  public async getPoster(title: string, year?: string | number): Promise<string | null> {
    if (!title) return null;

    // 1. Try with title + "(film)" first for movies as it avoids disambiguation pages
    let poster = await this.fetchWikipediaImage(`${title} (film)`);

    // 2. Try title + "(year film)" if year provided
    if (!poster && year) {
      poster = await this.fetchWikipediaImage(`${title} (${year} film)`);
    }

    // 3. Try exact title
    if (!poster) {
      poster = await this.fetchWikipediaImage(title);
    }

    return poster;
  }
}

// Export a ready-to-use instance typed to the interface
export const posterService: PosterProvider = new WikimediaPosterService();
