-- Replace broken sample PDF URLs with reliable public documents

update public.sns_publications
set pdf_url = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
where pdf_url like '%WAI/WCAG21/Techniques/pdf/img/table.pdf%';

update public.sns_publications
set pdf_url = 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'
where pdf_url = 'https://pdfobject.com/pdf/sample.pdf';
