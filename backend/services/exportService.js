const PDFDocument = require('pdfkit');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');

/**
 * Generate a PDF from structured resume content
 */
function generatePDF(resumeContent, templateStructure) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 55, right: 55 },
      });

      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Fonts
      const FONT_REGULAR = 'Helvetica';
      const FONT_BOLD = 'Helvetica-Bold';

      // Header styles
      const sectionHeader = (text) => {
        doc.moveDown(0.5);
        doc
          .font(FONT_BOLD)
          .fontSize(12)
          .text(text.toUpperCase(), { underline: true });
        doc.moveDown(0.3);
      };

      const sectionOrder = templateStructure?.sectionOrder || [
        'summary', 'education', 'experience', 'skills', 'projects', 'certifications', 'achievements',
      ];

      // Name/title at top
      if (resumeContent.summary) {
        doc.font(FONT_BOLD).fontSize(11).text('PROFESSIONAL SUMMARY');
        doc.moveDown(0.2);
        doc.font(FONT_REGULAR).fontSize(10).text(resumeContent.summary);
      }

      for (const section of sectionOrder) {
        switch (section) {
          case 'summary':
            // Already rendered above
            break;

          case 'education':
            if (resumeContent.education?.length) {
              sectionHeader('Education');
              for (const edu of resumeContent.education) {
                doc.font(FONT_BOLD).fontSize(10).text(edu.institution || '');
                doc.font(FONT_REGULAR).fontSize(9).text(
                  `${edu.degree || ''} ${edu.field ? 'in ' + edu.field : ''} | ${edu.startDate || ''} - ${edu.endDate || ''}${edu.gpa ? ' | GPA: ' + edu.gpa : ''}`
                );
                if (edu.details) doc.font(FONT_REGULAR).fontSize(9).text(edu.details);
                doc.moveDown(0.2);
              }
            }
            break;

          case 'experience':
            if (resumeContent.experience?.length) {
              sectionHeader('Experience');
              for (const exp of resumeContent.experience) {
                doc.font(FONT_BOLD).fontSize(10).text(`${exp.role || ''} — ${exp.company || ''}`);
                doc.font(FONT_REGULAR).fontSize(9).text(
                  `${exp.location || ''} | ${exp.startDate || ''} - ${exp.endDate || ''}`
                );
                if (exp.bullets?.length) {
                  for (const bullet of exp.bullets) {
                    doc.font(FONT_REGULAR).fontSize(9).text(`• ${bullet}`, { indent: 15 });
                  }
                }
                doc.moveDown(0.2);
              }
            }
            break;

          case 'skills':
            if (resumeContent.skills) {
              sectionHeader('Skills');
              const skillLines = [];
              if (resumeContent.skills.technical?.length)
                skillLines.push(`Technical: ${resumeContent.skills.technical.join(', ')}`);
              if (resumeContent.skills.tools?.length)
                skillLines.push(`Tools: ${resumeContent.skills.tools.join(', ')}`);
              if (resumeContent.skills.languages?.length)
                skillLines.push(`Languages: ${resumeContent.skills.languages.join(', ')}`);
              if (resumeContent.skills.soft?.length)
                skillLines.push(`Soft Skills: ${resumeContent.skills.soft.join(', ')}`);
              for (const line of skillLines) {
                doc.font(FONT_REGULAR).fontSize(9).text(line);
              }
            }
            break;

          case 'projects':
            if (resumeContent.projects?.length) {
              sectionHeader('Projects');
              for (const proj of resumeContent.projects) {
                doc.font(FONT_BOLD).fontSize(10).text(proj.title || '');
                if (proj.techStack?.length) {
                  doc.font(FONT_REGULAR).fontSize(9).text(`Tech: ${proj.techStack.join(', ')}`);
                }
                if (proj.description) doc.font(FONT_REGULAR).fontSize(9).text(proj.description);
                if (proj.bullets?.length) {
                  for (const bullet of proj.bullets) {
                    doc.font(FONT_REGULAR).fontSize(9).text(`• ${bullet}`, { indent: 15 });
                  }
                }
                doc.moveDown(0.2);
              }
            }
            break;

          case 'certifications':
            if (resumeContent.certifications?.length) {
              sectionHeader('Certifications');
              for (const cert of resumeContent.certifications) {
                doc.font(FONT_REGULAR).fontSize(9).text(
                  `${cert.name}${cert.issuer ? ' — ' + cert.issuer : ''}${cert.date ? ' (' + cert.date + ')' : ''}`
                );
              }
            }
            break;

          case 'achievements':
            if (resumeContent.achievements?.length) {
              sectionHeader('Achievements');
              for (const ach of resumeContent.achievements) {
                doc.font(FONT_REGULAR).fontSize(9).text(`• ${ach}`);
              }
            }
            break;
        }
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generate a DOCX from structured resume content
 */
async function generateDOCX(resumeContent, templateStructure) {
  const children = [];
  const sectionOrder = templateStructure?.sectionOrder || [
    'summary', 'education', 'experience', 'skills', 'projects', 'certifications', 'achievements',
  ];

  const sectionHeading = (text) =>
    new Paragraph({
      children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 24, font: 'Calibri' })],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 120 },
    });

  const normalText = (text) =>
    new Paragraph({
      children: [new TextRun({ text, size: 20, font: 'Calibri' })],
      spacing: { after: 60 },
    });

  const boldText = (text) =>
    new Paragraph({
      children: [new TextRun({ text, bold: true, size: 20, font: 'Calibri' })],
      spacing: { after: 40 },
    });

  const bulletText = (text) =>
    new Paragraph({
      children: [new TextRun({ text, size: 20, font: 'Calibri' })],
      bullet: { level: 0 },
      spacing: { after: 40 },
    });

  for (const section of sectionOrder) {
    switch (section) {
      case 'summary':
        if (resumeContent.summary) {
          children.push(sectionHeading('Professional Summary'));
          children.push(normalText(resumeContent.summary));
        }
        break;

      case 'education':
        if (resumeContent.education?.length) {
          children.push(sectionHeading('Education'));
          for (const edu of resumeContent.education) {
            children.push(boldText(edu.institution || ''));
            children.push(normalText(
              `${edu.degree || ''} ${edu.field ? 'in ' + edu.field : ''} | ${edu.startDate || ''} - ${edu.endDate || ''}${edu.gpa ? ' | GPA: ' + edu.gpa : ''}`
            ));
          }
        }
        break;

      case 'experience':
        if (resumeContent.experience?.length) {
          children.push(sectionHeading('Experience'));
          for (const exp of resumeContent.experience) {
            children.push(boldText(`${exp.role || ''} — ${exp.company || ''}`));
            children.push(normalText(`${exp.location || ''} | ${exp.startDate || ''} - ${exp.endDate || ''}`));
            if (exp.bullets?.length) {
              for (const b of exp.bullets) children.push(bulletText(b));
            }
          }
        }
        break;

      case 'skills':
        if (resumeContent.skills) {
          children.push(sectionHeading('Skills'));
          if (resumeContent.skills.technical?.length)
            children.push(normalText(`Technical: ${resumeContent.skills.technical.join(', ')}`));
          if (resumeContent.skills.tools?.length)
            children.push(normalText(`Tools: ${resumeContent.skills.tools.join(', ')}`));
          if (resumeContent.skills.languages?.length)
            children.push(normalText(`Languages: ${resumeContent.skills.languages.join(', ')}`));
          if (resumeContent.skills.soft?.length)
            children.push(normalText(`Soft Skills: ${resumeContent.skills.soft.join(', ')}`));
        }
        break;

      case 'projects':
        if (resumeContent.projects?.length) {
          children.push(sectionHeading('Projects'));
          for (const proj of resumeContent.projects) {
            children.push(boldText(proj.title || ''));
            if (proj.techStack?.length)
              children.push(normalText(`Tech: ${proj.techStack.join(', ')}`));
            if (proj.bullets?.length) {
              for (const b of proj.bullets) children.push(bulletText(b));
            }
          }
        }
        break;

      case 'certifications':
        if (resumeContent.certifications?.length) {
          children.push(sectionHeading('Certifications'));
          for (const cert of resumeContent.certifications) {
            children.push(normalText(
              `${cert.name}${cert.issuer ? ' — ' + cert.issuer : ''}${cert.date ? ' (' + cert.date + ')' : ''}`
            ));
          }
        }
        break;

      case 'achievements':
        if (resumeContent.achievements?.length) {
          children.push(sectionHeading('Achievements'));
          for (const ach of resumeContent.achievements) {
            children.push(bulletText(ach));
          }
        }
        break;
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer;
}

module.exports = { generatePDF, generateDOCX };
