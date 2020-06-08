// Creates a new flair to display
function createFlair(flairParent, flair, sectionContent) {
	const newFlairParent = $('<div class="col-4 flair-parent"></div>');
	const newFlair = $('<span class="flair"></span>');
	newFlair.addClass('flair-'+flairParent['parent']); // Game parent class
	newFlair.addClass('flair-'+flairParent['prefix']+'-'+flair['class']); // Faction class
	newFlair.text((flair['display']) ? flair['display'] : toTitleCase(flair['class'])); // Set faction name
	newFlairParent.html(newFlair);

	// Change selected flair on click
	newFlairParent.on('click', function() {
		updateFlair($(this).children('span').prop('class'), $(this).children('span').text());
	});

	sectionContent.append(newFlairParent);
}

// Updates the selected flair
function updateFlair(flairClasses, flairText) {
	// Visually update the flair
	$('#id-user-flair').removeClass($('#id-user-flair').prop('class'));
	$('#id-user-flair').addClass(flairClasses);
	if (is.not.empty(flairText) && is.not.space(flairText)) {
		$('#id-user-flair').text(flairText);
	} else {
		$('#id-user-flair').html('&nbsp;');
	}
	$('#id-user-flair').prop('title', flairText);
	$('#id-user-flair').prop('alt', flairText);

	// Update the subreddit message
	const chosenFlair = parseFlair($('#id-user-flair').prop('class'));
	$('#id-message').val(chosenFlair+'\n'+flairText+'\n\nDO NOT MODIFY THIS MESSAGE OR YOU WILL NOT RECEIVE YOUR FLAIR.');
}

$(function() {
	// Update visual flair text as they input in field
	$('#id-visual-message').on('input', function() {
		updateFlair($('#id-user-flair').prop('class'), $(this).val());
	});

	$('#flair-submit').on('submit', function(e) {
		e.preventDefault();
		$('#id-visual-message').trigger('input');
		$(this).unbind('submit').submit()
	});

	const tabNav = $('#v-pills-tab');
	const tabContent = $('#v-pills-tabContent');
	$.getJSON('./flairs.json', function(responseData, responseStatus, responsejqXHR) {
		let firstTab = true;
		for (let gameKey in responseData) {
			if (!responseData.hasOwnProperty(gameKey)) { continue }

			const gameDisplayTitle = responseData[gameKey]['tab-display'];
			delete responseData[gameKey]['tab-display'];

			// Create the visual tab for each game title
			const newGameTab = $('<a class="nav-link" id="v-pills-'+gameKey+'-tab" data-toggle="pill" role="tab">'+gameDisplayTitle+'</a>');
			newGameTab.attr('href', '#v-pills-'+gameKey);
			newGameTab.toggleClass('show active', firstTab);
			tabNav.append(newGameTab);

			// Create tab content
			const gameTabContentRow = $('<div class="row tab-pane fade" id="v-pills-'+gameKey+'" role="tabpanel"></div>');
			gameTabContentRow.toggleClass('show active', firstTab);
			tabContent.append(gameTabContentRow);

			const gameTabContent = $('<div class="col-12 no-gutters"></div>');
			gameTabContentRow.append(gameTabContent);

			if (firstTab)
				firstTab = false;

			// Go through each subchild - factions, playable, minor, etc.
			for (const flairsKey in responseData[gameKey]) {
				if (!responseData[gameKey].hasOwnProperty(flairsKey)) { continue }

				// Set flair parent title
				if (responseData[gameKey][flairsKey]['title']) {
					const sectionTitle = $('<h3>'+responseData[gameKey][flairsKey]['title']+'</h3>')
					if (responseData[gameKey][flairsKey]['subtitle'])
						sectionTitle.append(' <small class="text-muted">'+responseData[gameKey][flairsKey]['subtitle']+'</small>');
					gameTabContent.append(sectionTitle);
				}

				if (responseData[gameKey][flairsKey]['message']) {
					const sectionMessage = $('<h5>'+responseData[gameKey][flairsKey]['message']+'</h5>');
					gameTabContent.append(sectionMessage);
					continue;
				}

				// Set subtitle content
				const sectionContent = $('<div class="row no-gutters mb-4"></div>');

				$.each(responseData[gameKey][flairsKey]['flairs'], function(index, flair) {
					if (is.not.existy(flair['class'])) {
						const subsectionContent = $('<div class="row no-gutters col-12 py-3"></div>');
						sectionContent.append(subsectionContent);

						const subsectionTitle = $('<h5 class="col-12">'+toTitleCase(flair['title'])+'</h5>');
						if (flair['subtitle'])
							subsectionTitle.append(' <small class="text-muted">'+flair['subtitle']+'</small>');
						subsectionContent.append(subsectionTitle);

						$.each(flair['flairs'], function(index, flair) {
							createFlair(responseData[gameKey][flairsKey], flair, subsectionContent);
						});
					} else {
						createFlair(responseData[gameKey][flairsKey], flair, sectionContent);
					}
				});

				gameTabContent.append(sectionContent);
			}
		}
	}).fail(function(jqXFR, responseStatus, responseError) {
		console.log(jqXFR);
		console.log(responseStatus);
		console.log(responseError);
	});
});

// Parses a clean flair class
// Returns 'game-icon game-totalwar' from 'flair-game-icon flair-game-totalwar'
function parseFlair(flair) {
	const splitFlair = flair.split(' ');
	splitFlair.splice(0,1);
	splitFlair[0] = splitFlair[0].substring(6);
	splitFlair[1] = splitFlair[1].substring(6);
	return splitFlair.join(' ');
}

// Uppercases first letter of each word in a string
function toTitleCase(str) {
	return str.replace(/(?:^|\s)\w/g, function(match) {
		return match.toUpperCase();
	});
}

