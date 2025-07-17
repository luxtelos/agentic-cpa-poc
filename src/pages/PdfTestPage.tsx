import { useState, useEffect } from 'react'
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer'
import { saveAs } from 'file-saver'
import { processMarkdownToPdfSections } from '../lib/markdownProcessor'
import { measureText, calculateVerticalSpacing } from '../lib/pdfLayoutUtils'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica'
  },
  section: {
    marginBottom: 10
  },
  heading: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold'
  },
  paragraph: {
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 1.4
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold'
  },
  listItem: {
    fontSize: 12,
    marginBottom: 5
  }
})

export default function PdfTestPage() {
  const [content] = useState(`SECTION_HEADER: EXECUTIVE SUMMARY
CONTENT_BLOCK: FAKE COMPANY's current effective tax rate is 81.8%, significantly higher than the 21% federal corporate tax rate and the tech consulting industry average of 24-28%. Total potential annual savings of $295,141 are achievable through entity restructuring and tax credit optimization.

SECTION_HEADER: PRIORITIZED STRATEGIES
STRATEGY_BLOCK: STRATEGY #1: S-Corporation Conversion
METRIC: Estimated Annual Savings: $295,141
STEPS_LIST:
1. File Form 2553 with IRS by 03/15/2026
2. Amend corporate bylaws

SECTION_HEADER: IMPLEMENTATION ROADMAP
TABLE_START
QUARTER | KEY ACTIONS | DEADLINES
Q3 2025 | Initiate S-Corp conversion analysis | 09/30/2025
Q4 2025 | Establish Solo 401(k) | 12/31/2025
TABLE_END`)
  const [sections, setSections] = useState([])

  useEffect(() => {
    const processContent = async () => {
      try {
        const processed = await processMarkdownToPdfSections(content)
        setSections(processed)
      } catch (error) {
        console.error('Error processing content:', error)
      }
    }
    processContent()
  }, [content])

  if (!sections.length) {
    return <div>Processing document...</div>
  }

  const handleDownload = async () => {
    try {
      const blob = await pdf(
        <Document title="Tax Optimization Report" author="Tax Corporate Smart">
          <Page size="A4" style={styles.page}>
            {sections.map((section, i) => (
              <View key={i} style={[styles.section, { 
                marginBottom: calculateVerticalSpacing(10, section.content.length, section.type)
              }]}>
                {section.type === 'heading' && (
                  <Text style={styles.heading}>{section.content}</Text>
                )}
                {section.type === 'paragraph' && (
                  <Text style={styles.paragraph}>{section.content}</Text>
                )}
                {section.type === 'table' && section.rows && (
                  <View style={{ marginBottom: 10 }}>
                    {section.rows.map((row, rowIndex) => (
                      <View key={rowIndex} style={{ flexDirection: 'row' }}>
                        {row.map((cell, cellIndex) => (
                          <Text key={cellIndex} style={[{
                            flex: 1, 
                            border: '1px solid #ddd',
                            padding: 5,
                            fontSize: 10
                          }, rowIndex === 0 && styles.tableHeader]}>
                            {cell}
                          </Text>
                        ))}
                      </View>
                    ))}
                  </View>
                )}
                {section.type === 'list' && section.items && (
                  <View style={{ marginLeft: 15 }}>
                    {section.items.map((item, index) => (
                      <Text key={index} style={styles.listItem}>
                        • {item}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </Page>
        </Document>
      ).toBlob()
      saveAs(blob, 'tax-optimization-report.pdf')
    } catch (error) {
      console.error('PDF generation failed:', error)
    }
  }

  return (
    <div>
      <button onClick={handleDownload}>Download PDF</button>
      <div style={{ marginTop: 20, padding: 20, border: '1px solid #eee' }}>
        {sections.map((section, i) => (
          <div key={i} style={{ marginBottom: 20 }}>
            {section.type === 'heading' && (
              <h3 style={{ fontSize: 18, fontWeight: 'bold' }}>{section.content}</h3>
            )}
            {section.type === 'paragraph' && (
              <p style={{ fontSize: 14 }}>{section.content}</p>
            )}
            {section.type === 'table' && section.rows && (
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 10 }}>
                <tbody>
                  {section.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} style={{ 
                      backgroundColor: rowIndex === 0 ? '#f0f0f0' : 'transparent',
                      fontWeight: rowIndex === 0 ? 'bold' : 'normal'
                    }}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} style={{ 
                          border: '1px solid #ddd',
                          padding: 5,
                          fontSize: 12
                        }}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {section.type === 'list' && section.items && (
              <ul style={{ marginLeft: 20 }}>
                {section.items.map((item, index) => (
                  <li key={index} style={{ fontSize: 14, marginBottom: 5 }}>
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
