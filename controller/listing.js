const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res)=> {
    const allListings = await Listing.find({});  
    res.render("listings/index.ejs", {allListings});
}

module.exports.renderNewForm =  (req, res)=> {
    res.render("listings/new.ejs");  
};

module.exports.showListing = async (req, res)=> {
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path: "reviews", 
        populate: {
        path: "author",
        },
    })
    .populate("owner");
     if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/Listings");
    } 
    console.log(listing);
    res.render("listings/show.ejs", {listing});  
};

module.exports.createListing = async(req,res,next)=> {
    try {
        // Use the actual location from the form instead of hardcoded "New Delhi, India"
        const locationQuery = `${req.body.listing.location}, ${req.body.listing.country}`;
        
        let response = await geocodingClient
            .forwardGeocode({
                query: locationQuery,
                limit: 1,
            })
            .send();

        console.log(response.body);

        // Check if we got valid coordinates
        if (!response.body.features || response.body.features.length === 0) {
            req.flash("error", "Could not find coordinates for the specified location!");
            return res.redirect("/Listings/new");
        }

        let url = req.file.path;
        let filename = req.file.filename;
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = {url, filename};

        // Store the geometry data with proper structure
        if (response.body.features[0] && response.body.features[0].geometry) {
            newListing.geometry = {
                type: response.body.features[0].geometry.type,
                coordinates: response.body.features[0].geometry.coordinates
            };
        } else {
            // Provide default coordinates if geocoding fails
            newListing.geometry = {
                type: "Point",
                coordinates: [77.4126, 23.2599 ] // Default coordinates
            };
        }

        await newListing.save();
        console.log("New listing saved successfully");
        req.flash('success', "New Listing Created!");
        res.redirect("/Listings");
        
    } catch (error) {
        console.error("Error while fetching coordinates or saving listing:", error);
        req.flash("error", "Something went wrong while creating the listing!");
        res.redirect("/Listings/new");
    }
};

module.exports.renderEditForm = async (req, res)=> {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/Listings");
    } 
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/uploads", "/uploads/h_300,w_250");
   res.render("listings/edit.ejs", {listing, originalImageUrl});  
};

module.exports.updateListing = async (req, res)=> {
    try {
        let {id} = req.params;
        let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
        
        if (typeof req.file !== "undefined") {
            let url = req.file.path;
            let filename = req.file.filename;
            listing.image = {url, filename};
            await listing.save();
        }
        
        req.flash('success', "Listing Updated!");
        res.redirect(`/Listings/${id}`); 
    } catch (error) {
        console.error("Error updating listing:", error);
        req.flash("error", "Something went wrong while updating the listing!");
        res.redirect(`/Listings/${req.params.id}`);
    }
};

module.exports.deleteListing = async (req, res)=> {
    let {id} = req.params;
    let deleted = await Listing.findByIdAndDelete(id);
    console.log(deleted);
    req.flash('success', "Listing Deleted!");
    res.redirect("/Listings"); 
}