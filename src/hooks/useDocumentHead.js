import { useEffect } from 'react'

/**
 * Sets document title and meta description for the current page.
 * Title format: "Page | LogIQ"
 */
export function useDocumentHead(title, description) {
    useEffect(() => {
        const prev = document.title
        document.title = title ? `${title} | LogIQ` : 'LogIQ — Measure Your Mind'

        let metaDesc = document.querySelector('meta[name="description"]')
        const prevDesc = metaDesc?.getAttribute('content')
        if (description && metaDesc) {
            metaDesc.setAttribute('content', description)
        }

        return () => {
            document.title = prev
            if (metaDesc && prevDesc) metaDesc.setAttribute('content', prevDesc)
        }
    }, [title, description])
}
