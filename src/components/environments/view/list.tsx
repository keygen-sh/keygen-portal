import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Environment } from "@/types/environments"

interface EnvironmentsListProps {
  data: Environment[]
  onViewDetails: (environment: Environment) => void
}

export default function EnvironmentsList({
  data,
  onViewDetails,
}: EnvironmentsListProps) {
  return (
    <div className="flex flex-grow flex-col justify-between px-4">
      {data && data.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow className="pointer-events-none">
              <TableHead className="w-48">Name</TableHead>
              <TableHead className="w-12">Code</TableHead>
              <TableHead className="w-32">Isolation Strategy</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((env) => (
              <TableRow
                key={env.id}
                onClick={() => onViewDetails(env)}
                className="cursor-pointer"
              >
                <TableCell className="font-medium">
                  {env.attributes.name}
                </TableCell>
                <TableCell>{env.attributes.code}</TableCell>
                <TableCell>{env.attributes.isolationStrategy}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="my-8 text-center text-sm text-content-subdued">
          Looks empty. Create an environment to get started.
        </p>
      )}
    </div>
  )
}
