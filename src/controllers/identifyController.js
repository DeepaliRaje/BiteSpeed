const Contact = require("../models/Contact");

module.exports = async (req, res) => {
    const { email, phoneNumber } = req.body;

    if (!email && !phoneNumber) {
        return res.status(400).json({ error: "Email or phoneNumber required" });
    }

    try {

        // Step 1: Find matching contacts
        const existingContacts = await Contact.find({
            $or: [
                { email: email },
                { phoneNumber: phoneNumber }
            ]
        });

        // CASE 1: No contact found
        if (existingContacts.length === 0) {

            const newContact = await Contact.create({
                email,
                phoneNumber,
                linkPrecedence: "primary"
            });

            return res.json(formatResponse([newContact]));
        }

        // CASE 2: Contacts found
        await handleExistingContacts(existingContacts, email, phoneNumber, res);

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error" });
    }
};

async function handleExistingContacts(existingContacts, email, phoneNumber, res) {

    // Find all related contacts (including linked ones)
    const allContacts = await getAllLinkedContacts(existingContacts);

    //  Find oldest contact -> PRIMARY
    const primaryContact = allContacts.reduce((oldest, contact) =>
        contact.createdAt < oldest.createdAt ? contact : oldest
    );

    // Convert other primaries to secondary
    for (let contact of allContacts) {
        if (contact._id.toString() !== primaryContact._id.toString() 
            && contact.linkPrecedence === "primary") {

            contact.linkPrecedence = "secondary";
            contact.linkedId = primaryContact._id;
            await contact.save();
        }
    }

    // Check if new info exists
    const emailExists = allContacts.some(c => c.email === email);
    const phoneExists = allContacts.some(c => c.phoneNumber === phoneNumber);

    if (!emailExists || !phoneExists) {
        await Contact.create({
            email,
            phoneNumber,
            linkedId: primaryContact._id,
            linkPrecedence: "secondary"
        });
    }

    const finalContacts = await getAllLinkedContacts([primaryContact]);

    return res.json(formatResponse(finalContacts));
}

async function getAllLinkedContacts(contacts) {

    const ids = contacts.map(c => c._id);

    const linkedContacts = await Contact.find({
        $or: [
            { _id: { $in: ids } },
            { linkedId: { $in: ids } }
        ]
    });

    return linkedContacts;
}

function formatResponse(contacts) {

    if (!contacts || contacts.length === 0) {
        throw new Error("No contacts found to format");
    }

    // Find primary
    let primary = contacts.find(c => c.linkPrecedence === "primary");

    if (!primary) {
        // fallback → choose oldest contact as primary
        primary = contacts.reduce((oldest, contact) =>
            contact.createdAt < oldest.createdAt ? contact : oldest
        );
    }

    const emails = [...new Set(
        contacts.map(c => c.email).filter(Boolean)
    )];

    const phones = [...new Set(
        contacts.map(c => c.phoneNumber).filter(Boolean)
    )];

    const secondaryIds = contacts
        .filter(c => c.linkPrecedence === "secondary")
        .map(c => c._id);

    return {
        contact: {
            primaryContactId: primary._id,
            emails,
            phoneNumbers: phones,
            secondaryContactIds: secondaryIds
        }
    };
}