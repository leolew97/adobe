const fs = require('fs');

// Function to remove duplicates and reverse the order
function processLeads(leads) {
    const seenById = new Set();
    const seenByEmail = new Set();
    const cleanedLeads = [];
    const changesLog = [];

    // Iterate through the leads in reverse order
    for (let i = leads.length - 1; i >= 0; i--) {
        const lead = leads[i];

        // Check if this lead is a duplicate by _id or email
        if (!seenById.has(lead._id) && !seenByEmail.has(lead.email)) {
            cleanedLeads.push(lead);  // Keep this lead
            seenById.add(lead._id);   // Mark this _id as seen
            seenByEmail.add(lead.email);  // Mark this email as seen
        } else {
            // Since this is a duplicate, log the changes
            const originalLead = cleanedLeads.find(l => l._id === lead._id || l.email === lead.email);
            
            if (originalLead) {
                const changes = [];

                for (const field in lead) {
                    if (originalLead[field] !== lead[field]) {
                        changes.push({
                            field,
                            from: originalLead[field],
                            to: lead[field]
                        });
                    }
                }

                if (changes.length > 0) {
                    changesLog.push({
                        original: originalLead,
                        updated: lead,
                        changes: changes
                    });
                }
            }
        }
    }

    return {
        cleanedLeads: cleanedLeads,
        changesLog
    };
}

// Command line arguments parsing
const args = process.argv.slice(2);

if (args.length < 3) {
    console.log("Usage: node processLeads.js <inputFile> <outputFile> <changesLogFile>");
    process.exit(1);
}

const inputFile = args[0];
const outputFile = args[1];
const changesLogFile = args[2];

// Read input file
try {
    const leadsData = fs.readFileSync(inputFile, 'utf-8');
    const leads = JSON.parse(leadsData).leads;

    // Process the leads
    const { cleanedLeads, changesLog } = processLeads(leads);

    // Write the final output to the specified output file
    fs.writeFileSync(outputFile, JSON.stringify({ leads: cleanedLeads }, null, 2));
    console.log(`Final output written to ${outputFile}`);

    // Write the changes log to the specified changes log file
    fs.writeFileSync(changesLogFile, JSON.stringify(changesLog, null, 2));
    console.log(`Changes log written to ${changesLogFile}`);

} catch (err) {
    console.error(`Error processing the file: ${err.message}`);
    process.exit(1);
}