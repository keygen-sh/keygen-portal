import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Environment } from "@/types/environments"
import * as Loading from "@/components/loading"

interface EnvironmentsListProps {
  data: Environment[]
  fetching: boolean
  onViewDetails: (environment: Environment) => void
}

export default function EnvironmentsList({
  data,
  fetching,
  onViewDetails,
}: EnvironmentsListProps) {
  return (
    <div className="px-4">
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
      ) : fetching ? (
        <div className="flex h-[50vh] w-full items-center justify-center">
          <Loading.Dots />
        </div>
      ) : (
        <p className="my-8 text-center text-sm text-content-subdued">
          Looks empty. Create an environment to get started.
        </p>
      )}
    </div>
  )
}
