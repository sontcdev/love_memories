// Template factory for dynamic template selection

import type { Page, PageData } from './types'
import LoveTemplate from '@/app/[username]/home/LoveTemplate'
import EveryTemplate from '@/app/[username]/home/EveryTemplate'
import IdolTemplate from '@/app/[username]/home/IdolTemplate'

export function getTemplate(page: Page, pageData: PageData) {
    switch (page.template_type) {
        case 'LOVE':
            return <LoveTemplate page={page} pageData={pageData} />
        case 'EVERY':
            return <EveryTemplate page={page} pageData={pageData} />
        case 'IDOL':
            return <IdolTemplate page={page} pageData={pageData} />
        default:
            return <LoveTemplate page={page} pageData={pageData} />
    }
}
