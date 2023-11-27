import { AppRootProps, NavModelItem } from '@grafana/data';
import { PageDefinition } from 'pages';
import { useMemo, useState, useEffect } from 'react';
import { APP_TITLE, APP_SUBTITLE } from './consts';
import { config } from '@grafana/runtime';

type Args = {
  meta: AppRootProps['meta'];
  pages: PageDefinition[];
  path: string;
  tab: string;
};

export function useNavModel({ meta, pages, path, tab }: Args) {
  const [orgName, setOrgName] = useState<string>('');

  useEffect(() => {
    fetch('/api/org')
      .then((res) => res.json())
      .then((json) => {
        setOrgName(json.name);
      })
      .catch((err) => console.log);
  }, []);

  return useMemo(() => {
    const tabs: NavModelItem[] = [];

    pages.forEach(({ text, icon, id, role }) => {
      if (role.includes(config.bootData.user.orgRole)) {
        tabs.push({
          text,
          icon,
          id,
          url: `${path}?tab=${id}`,
        });

        if (tab === id) {
          tabs[tabs.length - 1].active = true;
        }
      }
    });

    // Fallback if current `tab` doesn't match any page
    if (!tabs.some(({ active }) => active)) {
      tabs[0].active = true;
    }

    const node = {
      text: APP_TITLE,
      img: meta.info.logos.large,
      subTitle: 'Sito: ' + orgName,
      url: path,
      children: tabs,
    };

    return {
      node,
      main: node,
    };
  }, [meta.info.logos.large, pages, path, tab, orgName]);
}
