const socialLinks = [
  {
    name: 'LinkedIn',
    className: 'social-linkedin',
    href: 'https://www.linkedin.com/',
    path: 'M5.2 8.6H2.1V22h3.1V8.6ZM3.65 2A1.8 1.8 0 1 0 3.7 5.6a1.8 1.8 0 0 0-.05-3.6ZM22 14.3c0-4.03-2.15-5.9-5.02-5.9a4.34 4.34 0 0 0-3.88 2.13V8.6H10V22h3.1v-6.63c0-1.75.33-3.45 2.5-3.45 2.15 0 2.18 2 2.18 3.56V22H22v-7.7Z',
  },
  {
    name: 'Facebook',
    className: 'social-facebook',
    href: 'https://www.facebook.com/',
    path: 'M13.5 22v-9.15h3.08l.46-3.57H13.5V7c0-1.03.29-1.73 1.77-1.73h1.89V2.08c-.33-.04-1.47-.14-2.8-.14-2.77 0-4.67 1.69-4.67 4.8v2.54H6.55v3.57h3.14V22h3.81Z',
  },
  {
    name: 'YouTube',
    className: 'social-youtube',
    href: 'https://www.youtube.com/',
    path: 'M23.5 6.2a3 3 0 0 0-2.1-2.13C19.55 3.55 12 3.55 12 3.55s-7.55 0-9.4.52A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.13c1.85.52 9.4.52 9.4.52s7.55 0 9.4-.52a3 3 0 0 0 2.1-2.13A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8ZM9.55 15.6V8.4L15.8 12l-6.25 3.6Z',
  },
  {
    name: 'WhatsApp',
    className: 'social-whatsapp',
    href: 'https://www.whatsapp.com/',
    path: 'M12.04 2a9.82 9.82 0 0 0-8.42 14.88L2.3 22l5.25-1.37A9.93 9.93 0 0 0 12.04 22h.01A10 10 0 0 0 12.04 2Zm0 18.18a8.23 8.23 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.32a8.18 8.18 0 1 1 6.99 3.87Zm4.5-6.13c-.25-.13-1.48-.73-1.71-.81-.23-.08-.4-.13-.57.13-.17.25-.65.81-.8.98-.15.17-.3.19-.55.06a6.8 6.8 0 0 1-2.01-1.24 7.5 7.5 0 0 1-1.39-1.73c-.15-.25-.02-.39.11-.52.12-.12.25-.3.38-.44.12-.15.16-.25.25-.42.08-.17.04-.31-.02-.44-.07-.13-.57-1.37-.78-1.88-.2-.5-.41-.43-.57-.44h-.49c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.25.9 2.45 1.02 2.62.13.17 1.77 2.7 4.28 3.79.6.26 1.06.41 1.42.53.6.19 1.14.16 1.57.1.48-.07 1.48-.61 1.69-1.2.21-.59.21-1.1.15-1.2-.06-.1-.23-.16-.48-.29Z',
  },
  {
    name: 'Instagram',
    className: 'social-instagram',
    href: 'https://www.instagram.com/',
    path: 'M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.25-3.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z',
  },
]

const resourceLinks = [
  {
    name: 'CISA',
    href: 'https://www.cisa.gov/',
    path: 'M12 2 3.5 5.4v5.3c0 5.2 3.6 9.5 8.5 11.3 4.9-1.8 8.5-6.1 8.5-11.3V5.4L12 2Zm0 2.1 6.5 2.6v4c0 4.1-2.7 7.7-6.5 9.3-3.8-1.6-6.5-5.2-6.5-9.3v-4L12 4.1Zm-1.1 10.8-2.7-2.7-1.4 1.4 4.1 4.1 6.3-6.3-1.4-1.4-4.9 4.9Z',
  },
  {
    name: 'NIST Cybersecurity',
    href: 'https://www.nist.gov/cybersecurity',
    path: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.92 9h-3.03a15.7 15.7 0 0 0-1.34-6.08A8.03 8.03 0 0 1 18.92 11ZM12 4c.97 1.18 1.63 3.88 1.84 7h-3.68c.21-3.12.87-5.82 1.84-7ZM4.08 13h3.03c.15 2.34.62 4.49 1.34 6.08A8.03 8.03 0 0 1 4.08 13ZM7.11 11H4.08a8.03 8.03 0 0 1 4.37-6.08A15.7 15.7 0 0 0 7.11 11ZM12 20c-.97-1.18-1.63-3.88-1.84-7h3.68c-.21 3.12-.87 5.82-1.84 7Zm2.55-.92A15.7 15.7 0 0 0 15.89 13h3.03a8.03 8.03 0 0 1-4.37 6.08Z',
  },
  {
    name: 'OWASP',
    href: 'https://owasp.org/',
    path: 'M12 2 3 5.4v5.2c0 5.1 3.7 9.6 9 11.4 5.3-1.8 9-6.3 9-11.4V5.4L12 2Zm0 2.1 7 2.6v3.9c0 4.1-2.8 7.7-7 9.4-4.2-1.7-7-5.3-7-9.4V6.7l7-2.6Zm-4 5v1.8h8V9.1H8Zm0 4v1.8h5.5v-1.8H8Z',
  },
]

function LinkGroup({ links, label, isSocial }) {
  return (
    <div className={`resource-link-group${isSocial ? ' social-link-group' : ' reference-link-group'}`} aria-label={label}>
      {links.map(({ name, href, path, className = '' }) => (
        <a
          className={`resource-link-icon ${className}`}
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={name}
          key={name}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d={path} /></svg>
        </a>
      ))}
    </div>
  )
}

function ResourceLinks() {
  return (
    <div className="resource-link-groups">
      <LinkGroup links={socialLinks} label="Social networks" isSocial />
      <LinkGroup links={resourceLinks} label="Cybersecurity resources" />
    </div>
  )
}

export default ResourceLinks
