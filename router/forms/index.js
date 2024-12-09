const express = require("express");
const app = express.Router();
const path = require("path");
const fs = require("fs");

const formsdata = require("../storage/forms/index.json");
const submissionsData = require("../storage/submissions/data.json");

app.get("/", (req, res) => {
	return res.json(formsdata);
});

app.post("/create", (req, res) => {
	try {
		const data = req.body;

		const filePath = path.join(__dirname, "../storage/forms/index.json");

		const fileData = fs.readFileSync(filePath, "utf8");
		let existingData = JSON.parse(fileData);
		existingData = {
			...existingData,
			[data.id]: data,
		};

		fs.writeFileSync(filePath, JSON.stringify(existingData));

		res.status(200).json({
			message: "Data written successfully",
			data: data,
		});
	} catch (error) {
		console.error("Error writing file:", error.message);
		res.status(500).json({
			message: "Error writing data",
			error: error.message,
		});
	}
});

app.get("/:id", (req, res) => {
	const id = req.params.id;
	return res.json(formsdata[id] || { message: "No Data Found" });
});

app.get("/:id/submissions", (req, res) => {
	const id = req.params.id;

	let output = submissionsData[id];
	if (!output) {
		let formDetails = formsdata[id];
		output = {
			title: formDetails?.formTitle,
		};
	} else {
		let submitted = [];
		let { formFields: field, formTitle } = formsdata[id];
		for (let key = 0; key < field?.length; key++) {
			let { id: fieldId, title: fieldTitle, fieldType } = field[key];
			let fieldSubmissions = [];
			let questionData = submissionsData[id]?.data || [];
			for (let sub = 0; sub < questionData.length; sub++) {
				fieldSubmissions.push({
					value: questionData[sub][fieldId],
					type: fieldType,
				});
			}

			submitted.push({
				fieldId,
				title: fieldTitle,
				data: fieldSubmissions,
			});
		}

		output = {
			title: formTitle,
			data: submitted,
		};
	}

	return res.json(output);
});

app.post("/submit", (req, res) => {
	try {
		const { formId, formTitle } = req.body;

		const filePath = path.join(__dirname, "../storage/submissions/data.json");

		let existingData = {};
		if (fs.existsSync(filePath)) {
			const fileContent = fs.readFileSync(filePath, "utf8");
			if (fileContent.trim()) {
				existingData = JSON.parse(fileContent);
			}
		} else {
			fs.writeFileSync(filePath, JSON.stringify({}, null, 2));
		}

		existingData = {
			...existingData,
			[formId]: {
				title: formTitle,
				data: [...(existingData[formId]?.data || []), req.body],
			},
		};

		fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));

		res.status(200).json({
			message: "Form submitted successfully",
		});
	} catch (error) {
		console.error("Error writing file:", error.message);
		res.status(500).json({
			message: "Error writing data",
			error: error.message,
		});
	}
});
module.exports = app;
