include "root" {
  path = find_in_parent_folders("root.hcl")
}

terraform {
  source = "git::github.com/rx-refill-reminders/terraform-modules//modules/s3-website?ref=s3-website%2Fv0&depth=0"
}

inputs = values
