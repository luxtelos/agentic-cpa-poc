# PDF Generation Flow

```mermaid
flowchart TD
    A[Tax Data] --> B[Markdown Processor]
    B --> C[Layout Engine]
    C --> D[PDF Generation]
    D --> E[HTML Preview]
    D --> F[PDF Download]
    
    style A fill:#f9f,stroke:#333
    style B fill:#bbf,stroke:#333
    style C fill:#bfb,stroke:#333
    style D fill:#fbb,stroke:#333
    style E fill:#bff,stroke:#333
    style F fill:#ffb,stroke:#333
```

## Components
- **Markdown Processor**: Converts raw content to structured sections
- **Layout Engine**: Calculates spacing and page breaks
- **PDF Generation**: Creates PDF document using pdf-lib
- **Outputs**: Interactive HTML preview and downloadable PDF
