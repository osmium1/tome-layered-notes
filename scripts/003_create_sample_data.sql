-- This script will create sample data for new users
-- It will be called after user confirmation to create a sample binder

CREATE OR REPLACE FUNCTION public.create_sample_binder_for_user(user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  binder_id UUID;
  notebook_id UUID;
  note_id UUID;
BEGIN
  -- Create sample binder
  INSERT INTO public.binders (user_id, title, description, color)
  VALUES (
    user_id,
    'Getting Started with Tome',
    'Learn how to use Tome effectively for your studies',
    '#10b981'
  )
  RETURNING id INTO binder_id;
  
  -- Create sample notebook
  INSERT INTO public.notebooks (binder_id, user_id, title, description)
  VALUES (
    binder_id,
    user_id,
    'How to Use Tome',
    'Essential tips and techniques'
  )
  RETURNING id INTO notebook_id;
  
  -- Create sample note with layered content
  INSERT INTO public.notes (notebook_id, user_id, title, content)
  VALUES (
    notebook_id,
    user_id,
    'Active Recall Techniques',
    '[
      {
        "id": "1",
        "level": 1,
        "content": "Active Recall",
        "isExpanded": false,
        "children": [
          {
            "id": "2",
            "level": 2,
            "content": "Testing Effect",
            "isExpanded": false,
            "children": [
              {
                "id": "3",
                "level": 3,
                "content": "Retrieving information from memory strengthens neural pathways",
                "isExpanded": false,
                "children": [
                  {
                    "id": "4",
                    "level": 4,
                    "content": "Example: Close your notes and try to recall key concepts",
                    "isExpanded": false,
                    "children": []
                  }
                ]
              }
            ]
          },
          {
            "id": "5",
            "level": 2,
            "content": "Spaced Repetition",
            "isExpanded": false,
            "children": [
              {
                "id": "6",
                "level": 3,
                "content": "Review material at increasing intervals",
                "isExpanded": false,
                "children": [
                  {
                    "id": "7",
                    "level": 4,
                    "content": "Day 1 → Day 3 → Day 7 → Day 21",
                    "isExpanded": false,
                    "children": []
                  }
                ]
              }
            ]
          }
        ]
      }
    ]'::jsonb
  );
  
  RETURN binder_id;
END;
$$;
