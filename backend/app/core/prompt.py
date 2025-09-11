prompt = """Based on this image of an annotated map, generate a realistic photographic preview of this location with the following specifications:

Date: {date}
Time of Day: {time_of_day}:00 (24-hour format)
Camera Focal Length: {focal_length}mm
Weather Conditions: {weather}

Please create a high-quality, realistic image that:
- Shows the actual geographic location from the map, that's specified by the annotations
- Reflects the lighting conditions for {time_of_day}:00 hours
- Incorporates {weather} weather conditions
- Uses a {focal_length}mm focal length perspective
- Captures the scene as it would appear on {date}
- Maintains geographic accuracy to the mapped location
- Includes appropriate seasonal elements for the date

Generate a photorealistic image that a photographer would capture at this exact location with these camera settings. Also generate a short title/filename for this image."""